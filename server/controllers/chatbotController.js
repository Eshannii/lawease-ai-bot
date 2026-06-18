import Groq from "groq-sdk";
import axios from "axios";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Your internal API base URL
const INTERNAL_API =
  process.env.INTERNAL_API_URL ||
  "https://lawease-ai-bot-production.up.railway.app";

// ─────────────────────────────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are LawEase AI, an expert legal research assistant for Pakistani lawyers.
You work like a sharp, knowledgeable legal researcher sitting right beside the lawyer.

TONE & RESPONSE STYLE:
- Match response length to the question. Short question = short answer. Detailed question = detailed answer.
- Be direct. Give the answer first, explanation after.
- Be conversational and natural — not like a textbook, not like a chatbot.
- ALWAYS respond in English only, regardless of the language the lawyer writes in (English, Urdu, or Roman Urdu). Understand their query in whatever language it's written, but your reply must be English.
- Never say "As an AI..." or "I cannot provide legal advice..."

FOLLOW-UP QUESTIONS — STRICT:
- Ask MAXIMUM 1 follow-up question per response.
- Only ask if the query is genuinely too vague to research.
- If you can make a reasonable assumption — MAKE IT and proceed. Do not stall.
- Never fire a list of questions at the lawyer.
- Do NOT end with generic offers like "would you like to know more?" or "shall I explain?"
- End substantive answers with a short practical/tactical note relevant to the case.
- For simple/short questions, this closing note is optional — don't force it.

SOURCES — ABSOLUTE RULES:
- You have access to an INTERNAL DATABASE of verified Pakistani case laws.
- ONLY cite cases that appear in the [DB SEARCH RESULTS] provided in this conversation.
- Citation format: "[Case Title] ([Court], [Year], Case No: [case_no]) — the court held that..."
- Use the EXACT title, court, year, and case_no as they appear in the DB results. Do not alter them.
- Do NOT cite any case from memory or training data. Ever.
- If DB results contain no relevant case: say exactly —
  "No matching case was found in our database for this matter. Under [Section/Act], the legal position is: [explanation]. For specific precedents, it is recommended to check the SCP or PLD database."

CASE RESEARCH FORMAT — use ONLY when user is researching a case or asks for full analysis.
Use this exact structure with markdown headings (##) so it can be cleanly exported as a legal memo:

## Applicable Law
[relevant sections/articles — no fluff]

## Legal Position
[clear, plain language explanation]

## Case References
[cite from DB results ONLY — if none: state the law, no invented citations]

## Application to the Present Matter
[connect to user's specific situation]

## Conclusion
[one clear concluding paragraph + practical tactical note]

FORMATTING RULES FOR EXPORT-READY OUTPUT:
- Do NOT use emojis anywhere in the response (memos must look professional when exported to Word/PDF).
- Use markdown headings (##), bold (**text**), and numbered/bulleted lists where appropriate — this gets converted into a formatted document.
- Keep paragraphs concise and well-structured, as this content may be directly exported into a client memo or court submission draft.
- A user asking a quick question deserves a quick answer — only use the full memo format above when the query genuinely calls for case research or detailed analysis.`;

// ─────────────────────────────────────────────────────────────
// STEP 1: LLM extracts search keywords from lawyer's query
// ─────────────────────────────────────────────────────────────
const extractKeywords = async (message, history = []) => {
  // Build a brief context from recent history so LLM understands follow-up queries
  const recentContext = history
    .slice(-4)
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const prompt = `You are a legal search assistant. Extract the most effective search keywords from the lawyer's query to search a Pakistani case law database.

Conversation context:
${recentContext || "(none)"}

Current query: "${message}"

Rules:
- Return 1 to 3 search keyword strings (each is a separate search)
- Each keyword should be short (2-5 words), specific, and in English
- Focus on legal terms: offence name, section number, court, legal concept
- If the query mentions specific facts (e.g. "property dispute in Karachi"), extract the legal concept ("property dispute" or "possession suit")
- For follow-up queries like "find more" or "related cases", use context to determine keywords
- Return ONLY a JSON array of strings, nothing else. Example: ["wrongful dismissal", "termination without notice"]`;

  try {
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
      temperature: 0.1,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || "[]";
    // Strip markdown fences if present
    const clean = raw.replace(/```json|```/g, "").trim();
    const keywords = JSON.parse(clean);
    return Array.isArray(keywords) ? keywords.slice(0, 3) : [];
  } catch (err) {
    console.error("Keyword extraction error:", err.message);
    // Fallback: use the raw message as keyword
    return [message.slice(0, 60)];
  }
};

// ─────────────────────────────────────────────────────────────
// STEP 2: Search internal DB for each keyword
// ─────────────────────────────────────────────────────────────
const searchInternalDB = async (keywords, authToken) => {
  if (!keywords.length) return null;

  try {
    // Run all keyword searches in parallel
    const searchPromises = keywords.map((kw) =>
      axios
        .get(`${INTERNAL_API}/api/search`, {
          params: { keyword: kw },
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
          timeout: 5000,
        })
        .then((res) => res.data.results || [])
        .catch(() => []),
    );

    const allResultArrays = await Promise.all(searchPromises);

    // Flatten + deduplicate by _id
    const seen = new Set();
    const combined = [];
    for (const arr of allResultArrays) {
      for (const item of arr) {
        if (!seen.has(item._id)) {
          seen.add(item._id);
          combined.push(item);
        }
      }
    }

    if (!combined.length) return null;

    // Build context string for LLM — exact fields from your DB
    let context = `=== DB SEARCH RESULTS ===\n`;
    context += `CRITICAL: Only cite cases listed below. Use exact title, court, year, case_no as shown.\n\n`;

    combined.forEach((item, i) => {
      context += `[CASE ${i + 1}]\n`;
      context += `Title: ${item.title || "N/A"}\n`;
      context += `Court: ${item.court || "N/A"}\n`;
      context += `Year: ${item.year || "N/A"}\n`;
      context += `Case No: ${item.case_no || "N/A"}\n`;
      context += `Result: ${item.result || "N/A"}\n`;
      context += `Summary: ${item.snippet || "N/A"}\n`;
      context += `---\n`;
    });

    return { context, count: combined.length };
  } catch (err) {
    console.error("Internal DB search error:", err.message);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────
// SKIP SEARCH — Pure greetings / ack messages
// ─────────────────────────────────────────────────────────────
const isGreeting = (message) => {
  const greetings = [
    "hello",
    "hi",
    "hey",
    "salam",
    "assalam",
    "shukriya",
    "thanks",
    "thank you",
    "theek hai",
    "ok",
    "okay",
    "acha",
    "achi",
    "ji",
    "haan",
    "nahi",
    "bye",
    "good",
  ];
  const lower = message.toLowerCase().trim();
  const words = lower.split(/\s+/);
  return words.length <= 3 && greetings.some((g) => lower.includes(g));
};

// ─────────────────────────────────────────────────────────────
// MAIN CONTROLLER
// ─────────────────────────────────────────────────────────────
export const chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== "string")
      return res.status(400).json({ message: "message is required" });

    // Get auth token from request (lawyer is logged in)
    const authToken = req.headers.authorization?.replace("Bearer ", "") || null;

    // Keep last 10 messages for context
    const chatMessages = history
      .filter((m) => ["user", "assistant"].includes(m.role))
      .slice(-10)
      .map((m) => ({ role: m.role, content: String(m.content) }));

    // ── RAG Pipeline ──────────────────────────────────────────
    let dbContext = null;
    let casesFound = 0;

    if (!isGreeting(message)) {
      // Step 1: Extract keywords using LLM
      const keywords = await extractKeywords(message, chatMessages);
      console.log("Extracted keywords:", keywords);

      // Step 2: Search internal DB
      if (keywords.length) {
        const dbResult = await searchInternalDB(keywords, authToken);
        if (dbResult) {
          dbContext = dbResult.context;
          casesFound = dbResult.count;
          console.log(`DB returned ${casesFound} cases`);
        }
      }
    }

    // ── Build messages for final LLM call ─────────────────────
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      // Inject DB results as system context so LLM treats them as ground truth
      ...(dbContext ? [{ role: "system", content: dbContext }] : []),
      ...chatMessages,
      { role: "user", content: message },
    ];

    // ── Final LLM response ────────────────────────────────────
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages,
      max_tokens: 2048,
      temperature: 0.2,
    });

    const reply =
      completion.choices[0]?.message?.content ||
      "I don't have enough verified information on this — recommend checking SCP/PLD database or a senior legal professional.";

    res.json({ reply, meta: { casesFound } });
  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ message: "AI service unavailable" });
  }
};
