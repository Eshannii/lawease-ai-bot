import React, { useState } from "react";
import {
  Search,
  Loader2,
  Gavel,
  AlertCircle,
  Scale,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Adjust this to match your setup:
// - Vite project     -> import.meta.env.VITE_API_URL
// - Create React App -> process.env.REACT_APP_API_URL
const API_BASE_URL = "https://lawease-ai-bot-production.up.railway.app";

const CaseLaw = () => {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  // Full judgment state: which card is expanded, its cached text,
  // and separate loading/error state so it never interferes with search.
  const [expandedId, setExpandedId] = useState(null);
  const [fullTextCache, setFullTextCache] = useState({});
  const [fullTextLoadingId, setFullTextLoadingId] = useState(null);
  const [fullTextError, setFullTextError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmed = keyword.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setSearched(true);
    setExpandedId(null);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE_URL}/api/search?keyword=${encodeURIComponent(trimmed)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.status === 401) {
        setError("Session expired. Please log in again.");
        setResults([]);
        return;
      }

      if (!res.ok) throw new Error("Request failed");

      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      setError("Could not fetch case laws. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Expands/collapses a card, fetching the full judgment text only
  // the first time it's opened (then serves it from cache).
  const handleToggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(id);
    setFullTextError("");

    if (fullTextCache[id]) return;

    setFullTextLoadingId(id);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}/api/search/case/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        setFullTextError("Session expired. Please log in again.");
        return;
      }

      if (!res.ok) throw new Error("Request failed");

      const data = await res.json();
      setFullTextCache((prev) => ({
        ...prev,
        [id]: data.case?.full_text || "Full text not available.",
      }));
    } catch (err) {
      setFullTextError("Could not load the full judgment. Please try again.");
    } finally {
      setFullTextLoadingId(null);
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
    <div className="min-h-screen bg-[#11162a] pt-20 sm:pt-28 pb-12 px-4 sm:px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <Gavel className="w-6 h-6 sm:w-7 sm:h-7 text-sky-400 flex-shrink-0" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100">
            Case Laws
          </h1>
        </div>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3 mb-8 sm:mb-10"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Enter a keyword — case title, court, or citation..."
              className="w-full pl-11 pr-4 py-3 rounded-full bg-white/[0.06] border border-white/[0.08] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 focus:bg-white/[0.08] transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !keyword.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#840a23] hover:bg-[#9c0c29] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
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
            {results.length} case{results.length !== 1 ? "s" : ""} found
          </p>
        )}

        {/* Empty state */}
        {searched && !loading && !error && results.length === 0 && (
          <div className="text-center py-16">
            <Scale className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">
              No case law found. Try another keyword.
            </p>
          </div>
        )}

        {/* Results list */}
        <div className="flex flex-col gap-4">
          {results.map((item) => {
            const isExpanded = expandedId === item._id;
            const isFullTextLoading = fullTextLoadingId === item._id;

            return (
              <div
                key={item._id}
                className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.12] transition-all"
              >
                <div className="flex items-start justify-between gap-3 sm:gap-4 mb-2">
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

                {/* Expand / collapse trigger */}
                <button
                  type="button"
                  onClick={() => handleToggleExpand(item._id)}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-sky-400 hover:text-sky-300 transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      Hide full judgment
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      Read full judgment
                    </>
                  )}
                </button>

                {/* Expanded full judgment */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/[0.08]">
                    {isFullTextLoading ? (
                      <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading full judgment...
                      </div>
                    ) : fullTextError ? (
                      <p className="text-sm text-red-400">{fullTextError}</p>
                    ) : (
                      <div className="max-h-[50vh] sm:max-h-[480px] overflow-y-auto pr-2 sm:pr-3 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                        {highlight(fullTextCache[item._id])}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CaseLaw;
