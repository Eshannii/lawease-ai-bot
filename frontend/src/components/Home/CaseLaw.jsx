import React, { useState } from "react";
import {
  Search,
  Loader2,
  Gavel,
  AlertCircle,
  Scale,
  Calendar,
  FileText,
} from "lucide-react";

// Adjust this to match your setup:
// - Vite project  -> import.meta.env.VITE_API_URL
// - Create React App -> process.env.REACT_APP_API_URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const CaseLaw = () => {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmed = keyword.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/search?keyword=${encodeURIComponent(trimmed)}`,
      );
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      setError("Case laws fetch nahi ho sake. Dobara koshish karein.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const highlight = (text) => {
    if (!text || !keyword.trim()) return text;
    const safeKeyword = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${safeKeyword})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === keyword.trim().toLowerCase() ? (
        <mark key={i} className="bg-[#840a23]/30 text-sky-300 rounded px-0.5">
          {part}
        </mark>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      ),
    );
  };

  return (
    <div className="min-h-screen bg-[#11162a] pt-28 pb-12 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Gavel className="w-7 h-7 text-sky-400" />
          <h1 className="text-2xl font-bold text-slate-100">Case Laws</h1>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Keyword likhen — case title, court, ya citation..."
              className="w-full pl-11 pr-4 py-3 rounded-full bg-white/[0.06] border border-white/[0.08] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 focus:bg-white/[0.08] transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !keyword.trim()}
            className="px-6 py-3 rounded-full bg-[#840a23] hover:bg-[#9c0c29] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Search
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Results count */}
        {searched && !loading && !error && (
          <p className="text-sm text-slate-400 mb-4">
            {results.length} case{results.length !== 1 ? "s" : ""} mile
            {results.length !== 1 ? "n" : ""}
          </p>
        )}

        {/* Empty state */}
        {searched && !loading && !error && results.length === 0 && (
          <div className="text-center py-16">
            <Scale className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">
              Is keyword se koi case law nahi mila.
            </p>
          </div>
        )}

        {/* Results list */}
        <div className="flex flex-col gap-4">
          {results.map((item) => (
            <div
              key={item._id}
              className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.12] transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-base font-semibold text-slate-100 leading-snug">
                  {highlight(item.title)}
                </h3>
                {item.result && (
                  <span className="flex-shrink-0 px-3 py-1 rounded-full bg-sky-400/10 text-sky-300 text-xs font-medium whitespace-nowrap">
                    {item.result}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-3">
                {item.court && (
                  <span className="flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5" />
                    {item.court}
                  </span>
                )}
                {item.year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {item.year}
                  </span>
                )}
                {item.case_no && (
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    {item.case_no}
                  </span>
                )}
              </div>

              {item.snippet && (
                <p className="text-sm text-slate-400 leading-relaxed">
                  {highlight(item.snippet)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CaseLaw;
