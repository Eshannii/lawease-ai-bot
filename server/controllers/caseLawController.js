import CaseLaw from "../models/CaseLaw.js";

// Match ke aas-paas ka text nikal kar ek chhota snippet banata hai,
// frontend wahi "snippet" field highlight karke dikhata hai.
const buildSnippet = (text, keyword, contextLength = 150) => {
  if (!text) return "";

  const index = text.toLowerCase().indexOf(keyword.toLowerCase());

  if (index === -1) {
    // keyword sirf title mein mila ho to full_text ka starting hissa dikha do
    return (
      text.slice(0, contextLength * 2) +
      (text.length > contextLength * 2 ? "..." : "")
    );
  }

  const start = Math.max(0, index - contextLength);
  const end = Math.min(text.length, index + keyword.length + contextLength);

  return (
    (start > 0 ? "..." : "") +
    text.slice(start, end) +
    (end < text.length ? "..." : "")
  );
};

export const searchCaseLaws = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword || !keyword.trim()) {
      return res.status(400).json({
        success: false,
        error: "Keyword is required",
      });
    }

    const trimmedKeyword = keyword.trim();

    const cases = await CaseLaw.find(
      { $text: { $search: trimmedKeyword } },
      { score: { $meta: "textScore" } },
    )
      .select("title case_no court year result full_text")
      .sort({ score: { $meta: "textScore" } })
      .limit(20);

    const results = cases.map((c) => ({
      _id: c._id,
      title: c.title,
      case_no: c.case_no,
      court: c.court,
      year: c.year,
      result: c.result,
      snippet: buildSnippet(c.full_text, trimmedKeyword),
    }));

    return res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("CASE LAW SEARCH ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
