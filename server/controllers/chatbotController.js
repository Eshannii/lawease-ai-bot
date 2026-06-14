import Groq from "groq-sdk";
import axios from "axios";
import Exa from "exa-js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const exa = new Exa(process.env.EXA_API_KEY);

// ─────────────────────────────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are VakilAI, an expert legal research assistant for Pakistani lawyers.
You work like a sharp, knowledgeable legal researcher sitting right beside the lawyer.

TONE & RESPONSE STYLE:
- Match response length to the question. Short question = short answer. Detailed question = detailed answer.
- Be direct. Give the answer first, explanation after.
- Be conversational and natural — not like a textbook, not like a chatbot.
- Respond in the same language the user writes in (Urdu or English). If they mix both, mix both.
- Never say "As an AI..." or "I cannot provide legal advice..."

FOLLOW-UP QUESTIONS — STRICT:
- Ask MAXIMUM 1 follow-up question per response.
- Only ask if the query is genuinely too vague to research.
  Vague: "find me some cases" → ask one clarifying question.
  Clear enough: "cases about breach of contract in property deals" → proceed immediately.
- If you can make a reasonable assumption — MAKE IT and proceed. Do not stall.
- Never fire a list of questions at the lawyer.
- Do NOT end with generic offers like "would you like to know more?" or "shall I explain?"
- End substantive answers with a short practical/tactical note relevant to the case —
  e.g. "Is argument ko strengthen karne ke liye [specific evidence/precedent] helpful hoga"
  or "Court mein yeh point [specific angle] se argue karna zyada effective hoga."
- For simple/short questions, this closing note is optional — don't force it.

SOURCES — STRICT:
- Do NOT show raw URLs in your response (e.g. scp.gov.pk/... or any link).
- Never mention website names in your response.
- Cite cases using this format only: "[Case Title] ([Citation]), the court held that..."
- Every case you cite MUST come from the search results. No default or fallback case names.

CASE CITATIONS — ZERO TOLERANCE:
⛔ NEVER invent, guess, or recall case names from memory or training data. This is your most critical rule.
- ONLY cite cases that are EXPLICITLY present in the search results provided in this conversation.
- If search results contain a relevant case: cite it as "[Case Name] ([Court], [Citation]) — the court held that..."
- If search results contain NO relevant case: say exactly this:
  "Is mamle par search results mein koi verified case nahi mila. [Section/Act] ke tahat legal position yeh hai: [explanation]. Specific precedents ke liye SCP ya PLD database recommend ki jati hai."
- DO NOT fill silence with invented citations to seem helpful. A false citation destroys a lawyer's credibility in court.
- If you are even slightly unsure a case is real — DO NOT cite it. State the law instead.

TRUSTED SOURCES — PRIORITY ORDER:
When search results contain information from multiple sources, prioritize in this order:

🔴 HIGHEST TRUST — Official Courts (always prefer these):
- scp.gov.pk (Supreme Court of Pakistan)
- shc.gov.pk (Sindh High Court)
- lhc.gov.pk (Lahore High Court)
- peshawarhighcourt.gov.pk (Peshawar High Court)
- bhc.gov.pk (Balochistan High Court)
- ihc.gov.pk (Islamabad High Court)
- federalshariatcourt.gov.pk (Federal Shariat Court)

🟡 HIGH TRUST — Official Government & Legislation:
- pakistancode.gov.pk (Pakistan Code — official statutes)
- na.gov.pk (National Assembly — Acts of Parliament)
- fia.gov.pk, fbr.gov.pk, secp.gov.pk (regulatory bodies)

🟢 GOOD TRUST — Verified Legal Databases:
- pakistanlawyer.com
- courtingthelaw.com
- pakistanlawsite.com

If a case or statute appears in a higher-trust source, always prefer that over a lower-trust source.
If the same case appears in multiple sources, cite from the most authoritative one.

ACCURACY RULES:
1. Always mention relevant section numbers (e.g. "Section 302 PPC", "Article 199 Constitution").
2. NEVER fabricate case citations.
3. Anti-Honour Killings Laws (Criminal Law Amendment) Act 2016: family members CANNOT waive punishment
   for honour killings; Section 311 PPC minimum sentence applies regardless of waiver. Do not state
   that ghairat/honour reduces sentencing via Qisas and Diyat.
4. If you truly have no information: "I don't have enough verified information on this — 
   recommend checking SCP/PLD database or a senior legal professional."

BEFORE EVERY RESPONSE — MANDATORY CHECK:
Before writing, ask yourself:
1. Did search results above contain a relevant case? YES → cite it properly. NO → state the law only, no case names.
2. Am I about to write a case name NOT in the search results? YES → delete it immediately.

CASE RESEARCH FORMAT — use ONLY when user is clearly researching a case or asks for full analysis:

⚖️ Applicable Law
[relevant sections/articles — no fluff]

📖 What the Law Says
[clear, plain language explanation]

🏛️ Case References
[cite from search results ONLY — if none found: "Search results mein koi verified case nahi mila. SCP/PLD database par research recommend ki jati hai."]

🔍 How It Applies
[connect to user's specific situation]

💡 Bottom Line
[one clear concluding sentence + practical tactical note]

A user asking a quick question deserves a quick answer. Save the full format for when they need it.`;

// ─────────────────────────────────────────────────────────────
// PDF HELPER
// ─────────────────────────────────────────────────────────────
const JINA_READER_PREFIX = "https://r.jina.ai/";
const MAX_PDF_CHARS = 6000;

const isPdfUrl = (url = "") => url.toLowerCase().split("?")[0].endsWith(".pdf");

const fetchPdfViaJina = async (url) => {
  try {
    const headers = process.env.JINA_API_KEY
      ? { Authorization: `Bearer ${process.env.JINA_API_KEY}` }
      : {};
    const response = await axios.get(`${JINA_READER_PREFIX}${url}`, {
      timeout: 10000,
      headers,
    });
    let text =
      typeof response.data === "string"
        ? response.data
        : JSON.stringify(response.data);
    return text.length > MAX_PDF_CHARS
      ? text.slice(0, MAX_PDF_CHARS) + "... [truncated]"
      : text;
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────────────────────
// TAVILY — Keyword-based case law + statute search
// ─────────────────────────────────────────────────────────────
const tavilySearch = async (query) => {
  try {
    // Primary: case law search — NO include_domains restriction
    const caseRes = await axios.post(
      "https://api.tavily.com/search",
      {
        api_key: process.env.TAVILY_API_KEY,
        query: `Pakistan court judgment case law ${query} PLD SCMR`,
        search_depth: "advanced",
        max_results: 5,
        include_answer: true,
        include_raw_content: false,
      },
      { timeout: 7000 },
    );
    const caseResults = caseRes.data.results || [];

    // Secondary: statute search — only if case results are sparse
    let statuteResults = [];
    if (caseResults.length < 2) {
      const statRes = await axios.post(
        "https://api.tavily.com/search",
        {
          api_key: process.env.TAVILY_API_KEY,
          query: `Pakistan law statute section act ${query}`,
          search_depth: "basic",
          max_results: 3,
          include_answer: true,
          include_raw_content: false,
        },
        { timeout: 7000 },
      );
      statuteResults = statRes.data.results || [];
    }

    const allResults = [...caseResults, ...statuteResults];
    if (!allResults.length) return null;

    // Enrich PDFs via Jina
    const enriched = await Promise.all(
      allResults.map(async (r) => {
        if (isPdfUrl(r.url)) {
          const pdfText = await fetchPdfViaJina(r.url);
          return { ...r, content: pdfText || r.content || "" };
        }
        return r;
      }),
    );

    const valid = enriched.filter(
      (r) => r.content && r.content.trim().length > 50,
    );
    if (!valid.length) return null;

    let context = `=== TAVILY SEARCH RESULTS for "${query}" ===\n`;
    context += `IMPORTANT: Only cite cases that appear below. Never use memory for citations.\n\n`;

    const casePart = valid.filter((r) =>
      caseResults.some((c) => c.url === r.url),
    );
    const statPart = valid.filter((r) =>
      statuteResults.some((s) => s.url === r.url),
    );

    if (casePart.length) {
      context += `--- CASE LAW ---\n`;
      casePart.forEach((r, i) => {
        context += `[CASE ${i + 1}] ${r.title}\n${r.content}\n\n`;
      });
    }
    if (statPart.length) {
      context += `--- STATUTES ---\n`;
      statPart.forEach((r, i) => {
        context += `[LAW ${i + 1}] ${r.title}\n${r.content}\n\n`;
      });
    }

    return context;
  } catch (err) {
    console.error("Tavily error:", err.message);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────
// EXA — Semantic similarity search for case law
// ─────────────────────────────────────────────────────────────
const exaSearch = async (query) => {
  try {
    const result = await exa.searchAndContents(
      `Pakistani court judgment or case law about: ${query}`,
      {
        type: "neural",
        numResults: 3,
        text: { maxCharacters: 2000 },
      },
    );

    const results = result.results || [];
    if (!results.length) return null;

    let context = `=== EXA SEMANTIC SEARCH RESULTS ===\n`;
    context += `(Semantically similar cases — cite only if directly relevant)\n\n`;
    results.forEach((r, i) => {
      context += `[SIMILAR CASE ${i + 1}] ${r.title || "Untitled"}\n${r.text || ""}\n\n`;
    });

    return context;
  } catch (err) {
    console.error("Exa error:", err.message);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────
// SEARCH TRIGGER — Skip only for pure greetings
// ─────────────────────────────────────────────────────────────
const needsWebSearch = (message) => {
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

  // Very short message AND it's a greeting → skip search
  if (words.length <= 3 && greetings.some((g) => lower.includes(g)))
    return false;

  return true;
};

// ─────────────────────────────────────────────────────────────
// CITATION VALIDATOR — Post-response hallucination check
// ─────────────────────────────────────────────────────────────
const validateCitations = (reply, searchContext) => {
  // Extract all Pakistani legal citations from the model's reply
  // Matches: PLD 2021 SC 488, SCMR 2019, MLD 2020, CLC 2018, PTD 2017 etc.
  const citationPattern = /(PLD|SCMR|MLD|CLC|PTD|YLR|PLJR)\s+\d{4}/gi;
  const foundCitations = reply.match(citationPattern) || [];

  if (!foundCitations.length) return { isValid: true, unverified: [] };
  if (!searchContext) return { isValid: false, unverified: foundCitations };

  // Check each citation against search results
  const unverified = foundCitations.filter(
    (citation) => !searchContext.toLowerCase().includes(citation.toLowerCase()),
  );

  return {
    isValid: unverified.length === 0,
    unverified,
  };
};

// ─────────────────────────────────────────────────────────────
// MAIN CONTROLLER
// ─────────────────────────────────────────────────────────────
export const chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== "string")
      return res.status(400).json({ message: "message is required" });

    // Keep last 10 messages for better context in ongoing legal research
    const chatMessages = history
      .filter((m) => ["user", "assistant"].includes(m.role))
      .slice(-10)
      .map((m) => ({ role: m.role, content: String(m.content) }));

    // Run Tavily + Exa in parallel — hard 6s cap on both combined
    let searchContext = null;

    if (needsWebSearch(message)) {
      const [tavilyResult, exaResult] = await Promise.race([
        Promise.all([tavilySearch(message), exaSearch(message)]),
        new Promise((resolve) => setTimeout(() => resolve([null, null]), 6000)),
      ]);

      const parts = [tavilyResult, exaResult].filter(Boolean);
      if (parts.length) searchContext = parts.join("\n\n");
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(searchContext ? [{ role: "system", content: searchContext }] : []),
      ...chatMessages,
      { role: "user", content: message },
    ];

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages,
      max_tokens: 2048,
      temperature: 0.2,
    });

    let reply =
      completion.choices[0]?.message?.content ||
      "I don't have enough verified information on this — recommend checking SCP/PLD database or a senior legal professional.";

    // Post-response citation validation
    const { isValid, unverified } = validateCitations(reply, searchContext);
    if (!isValid && unverified.length > 0) {
      console.warn("⚠️ Unverified citations detected:", unverified);
      reply +=
        "\n\n---\n⚠️ **Note:** " +
        `The citation(s) ${unverified.join(", ")} could not be verified in current search results. ` +
        "Please confirm via SCP or PLD database before use in court.";
    }

    res.json({ reply });
  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ message: "AI service unavailable" });
  }
};
