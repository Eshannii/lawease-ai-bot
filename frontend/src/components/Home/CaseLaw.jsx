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
  Bookmark,
  Building2,
} from "lucide-react";

// API Base URL Configuration
const API_BASE_URL = "https://lawease-ai-bot-production.up.railway.app";

const CaseLaw = () => {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  // Full judgment state
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
        <mark
          key={i}
          className="bg-amber-100 text-[#7A0913] font-bold rounded px-1 py-0.5"
        >
          {part}
        </mark>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      ),
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 px-4 sm:px-6 md:px-10 pb-12 text-slate-700 font-sans antialiased relative overflow-x-hidden">
      {/* 3D Luxury Glassmorphic Ambient Backdrops */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-12 right-12 w-[600px] h-[600px] bg-gradient-to-br from-blue-200/20 to-indigo-100/30 rounded-full blur-[140px] opacity-80" />
        <div className="absolute top-1/4 -left-20 w-[450px] h-[450px] bg-gradient-to-tr from-[#7A0913]/5 to-amber-100/20 rounded-full blur-[120px] opacity-60" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        {/* Premium Elite Hero Section */}
        <div className="text-center space-y-4 py-6 border-b border-slate-200/60">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-[11px] font-bold tracking-widest text-[#1E3A8A] uppercase mx-auto">
            <Scale className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>LawEase Precedent Engine</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight max-w-2xl mx-auto leading-tight">
            Search Reliable{" "}
            <span className="font-serif italic font-normal text-[#7A0913]">
              Pakistani Case Laws
            </span>
          </h1>

          <p className="text-slate-400 text-xs sm:text-sm font-light max-w-xl mx-auto">
            Instant access to verified legal citations, constitutional rulings,
            and comprehensive judicial records across Supreme Court and
            Provincial High Courts.
          </p>
        </div>

        {/* High-End Global Search Controller */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-[0_15px_35px_rgba(30,58,138,0.02)]">
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-[#1E3A8A]" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter search keywords — case title, court name, or citations..."
                className="w-full bg-slate-50 border border-slate-200 text-sm pl-11 pr-4 py-3 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 transition-all duration-200"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !keyword.trim()}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#7A0913] hover:bg-[#94121E] active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Gavel className="w-4 h-4" />
              )}
              <span>Execute Query</span>
            </button>
          </form>
        </div>

        {/* Error Alert Channel */}
        {error && (
          <div className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold shadow-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Dynamic Meta Tracking Stats */}
        {searched && !loading && !error && (
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Search Yields: {results.length} Documented Case
              {results.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Architectural Empty Search State */}
        {searched && !loading && !error && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-200 bg-white rounded-2xl text-slate-400 shadow-[inset_0_4px_12px_rgba(0,0,0,0.01)]">
            <div className="p-4 bg-slate-50 rounded-full border border-slate-100 mb-3 text-slate-300">
              <Building2 className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-xs font-bold tracking-wide text-slate-600">
              No Judgments Aligned
            </p>
            <p className="text-[11px] font-light text-slate-400 mt-0.5">
              Alter your structural search terms or specify alternative court
              criteria.
            </p>
          </div>
        )}

        {/* Core Case Documents Feed */}
        <div className="flex flex-col gap-5">
          {results.map((item) => {
            const isExpanded = expandedId === item._id;
            const isFullTextLoading = fullTextLoadingId === item._id;

            return (
              <div
                key={item._id}
                className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.005)] transition-all duration-200 hover:shadow-[0_15px_35px_rgba(30,58,138,0.02)] hover:-translate-y-0.5"
              >
                {/* Header Profile Meta */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug flex-1">
                    {highlight(item.title)}
                  </h3>
                  {item.result && (
                    <span className="flex-shrink-0 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100 tracking-wide uppercase shadow-sm">
                      {item.result}
                    </span>
                  )}
                </div>

                {/* Secure Tags Infrastructure */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500 mb-4 pb-3 border-b border-slate-100">
                  {item.court && (
                    <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-lg text-[11px]">
                      <Scale className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span className="font-semibold text-slate-700">
                        {item.court}
                      </span>
                    </span>
                  )}
                  {item.year && (
                    <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-300" />
                      <span>{item.year}</span>
                    </span>
                  )}
                  {item.case_no && (
                    <span className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                      <FileText className="w-3.5 h-3.5 text-slate-300" />
                      <span>{item.case_no}</span>
                    </span>
                  )}
                </div>

                {/* Excerpt Summary Snippet */}
                {item.snippet && (
                  <p className="text-slate-600 text-sm leading-relaxed font-normal bg-slate-50/50 p-3.5 border border-slate-100 rounded-xl">
                    {highlight(item.snippet)}
                  </p>
                )}

                {/* Detailed Sheet Expand Trigger Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleExpand(item._id)}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#1E3A8A] hover:text-[#7A0913] transition-colors uppercase tracking-wider"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>Collapse Brief</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>Access Full Judgment</span>
                    </>
                  )}
                </button>

                {/* Luxury Sheet Reveal Pipeline */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-200/60">
                    {isFullTextLoading ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase py-6 tracking-widest animate-pulse justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-[#7A0913]" />
                        <span>Decrypting Legal Precedent...</span>
                      </div>
                    ) : fullTextError ? (
                      <p className="text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                        {fullTextError}
                      </p>
                    ) : (
                      <div className="max-h-[50vh] sm:max-h-[450px] overflow-y-auto pr-2 text-sm text-slate-700 leading-relaxed font-sans font-light bg-slate-50 p-4 border border-slate-100 rounded-xl whitespace-pre-wrap shadow-inner [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
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
