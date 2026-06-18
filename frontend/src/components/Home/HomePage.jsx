import React, { useState } from "react";
import {
  Scale,
  ArrowRight,
  Search,
  Bot,
  FileText,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Link, useNavigate } from "react-router";

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate("/login", { state: { initialSearch: searchQuery } });
  };

  return (
    <div className="relative min-h-screen bg-[#F6F8FA] text-slate-800 flex flex-col font-sans selection:bg-[#7A0913]/10 selection:text-[#7A0913] overflow-x-hidden">
      {/* Deepened Luxury Ambient Background with Side Tints */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Soft Left Side Indigo Dynamic Glow */}
        <div className="absolute top-1/4 -left-60 w-[400px] sm:w-[800px] h-[400px] sm:h-[800px] bg-indigo-100/50 rounded-full blur-[100px] sm:blur-[160px] opacity-70" />

        {/* Rich Right Side Soft Blue Blur */}
        <div className="absolute -top-40 -right-40 w-[350px] sm:w-[700px] h-[350px] sm:h-[700px] bg-blue-100/60 rounded-full blur-[90px] sm:blur-[150px] opacity-70" />

        {/* Maroon Accent Depth */}
        <div className="absolute bottom-10 left-1/3 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-[#7A0913]/5 rounded-full blur-[100px] sm:blur-[140px] opacity-40" />

        {/* Semantic Fine Tech Grid Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_10%,#000_70%,transparent_100%)] opacity-40" />
      </div>

      {/* Header */}
      <header className="relative z-30 border-b border-slate-200/70 backdrop-blur-md bg-white/75 sticky top-0 shadow-[0_2px_20px_rgba(30,58,138,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#1E3A8A] to-[#7A0913] rounded-lg shadow-sm transition-transform group-hover:scale-105">
              <Scale className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <span className="text-sm sm:text-base md:text-lg font-bold tracking-[0.15em] text-[#1E3A8A]">
              LAWEASE <span className="text-[#C5A059] font-semibold">BOT</span>
            </span>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/login"
              className="px-3 sm:px-5 py-2 rounded-lg text-xs font-semibold tracking-wider text-slate-600 hover:text-[#1E3A8A] transition-colors"
            >
              LOGIN
            </Link>

            <Link
              to="/signup"
              className="px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#12255c] text-white text-[11px] sm:text-xs font-semibold tracking-wider rounded-lg shadow-sm hover:shadow-md hover:from-[#12255c] hover:to-[#0f1e4a] transition-all"
            >
              SIGN UP
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center py-12 sm:py-24 px-4 sm:px-6 lg:px-8">
        {/* Hero Content Area */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          {/* Premium Animated Badge */}
          <div className="inline-flex items-center gap-2 mb-6 sm:mb-8 px-3 sm:px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-[0_4px_15px_rgba(30,58,138,0.03)]">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#C5A059] animate-pulse" />
            <span className="text-[9px] sm:text-xs font-bold tracking-[0.15em] sm:tracking-[0.2em] text-slate-500 uppercase">
              PAKISTANI JURISPRUDENCE • RAG POWERED
            </span>
          </div>

          {/* Luxury Typography Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[1.15] sm:leading-[1.1] mb-6 sm:mb-8 text-slate-900">
            Intelligent Legal Research
            <br />
            <span className="font-serif italic font-normal bg-gradient-to-r from-[#7A0913] via-[#1E3A8A] to-[#7A0913] bg-clip-text text-transparent">
              Redefined.
            </span>
          </h1>

          {/* Minimalist, Clean Description */}
          <p className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base lg:text-lg text-slate-500/90 leading-relaxed mb-10 sm:mb-12 font-light px-2">
            Instant citations retrieval and context-aware analysis across vast
            Supreme Court and High Court precedents. Chat with{" "}
            <span className="text-[#1E3A8A] font-semibold border-b border-[#1E3A8A]/20 pb-0.5">
              LawEase Bot
            </span>{" "}
            to transform your legal research workflow.
          </p>

          {/* Elevated Interactive Search Form (Added Bluis Drop Shadows) */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto mb-10 sm:mb-12 p-2 bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-[0_15px_45px_rgba(30,58,138,0.07)] flex items-center gap-2 transition-all focus-within:border-blue-300 focus-within:shadow-[0_15px_50px_rgba(30,58,138,0.12)]"
          >
            <div className="flex items-center gap-2 pl-2 sm:pl-3 text-slate-400 flex-1">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search PLD, SCMR, CLC citations or legal keywords..."
                className="w-full bg-transparent text-slate-700 placeholder-slate-400 text-xs sm:text-sm outline-none border-none py-2"
              />
            </div>
            <button
              type="submit"
              className="bg-slate-900 text-white p-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <span className="hidden sm:inline">Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Redirect Button */}
          <div className="flex justify-center items-center">
            <button
              onClick={() => navigate("/login")}
              className="group w-full sm:w-auto bg-gradient-to-r from-[#7A0913] to-[#91131E] hover:from-[#61040b] hover:to-[#7A0913] text-white px-8 py-3.5 sm:py-4 rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-[0_10px_25px_rgba(122,9,19,0.15)] hover:shadow-[0_12px_30px_rgba(122,9,19,0.25)] flex items-center justify-center gap-2"
            >
              <Bot className="w-4 h-4" />
              Launch Bot Interface
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Features Grid with Bluish Drop Shadow Depth */}
        <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-12">
          <div className="bg-white border border-slate-200/80 p-5 sm:p-6 rounded-2xl shadow-[0_10px_35px_rgba(30,58,138,0.03)] hover:shadow-[0_15px_40px_rgba(30,58,138,0.06)] hover:border-blue-200/80 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#1E3A8A] mb-4 group-hover:scale-110 transition-transform shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1.5">
              RAG Analysis
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Context-aware conversational intelligence trained specifically on
              Pakistani legal frameworks.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 sm:p-6 rounded-2xl shadow-[0_10px_35px_rgba(30,58,138,0.03)] hover:shadow-[0_15px_40px_rgba(30,58,138,0.06)] hover:border-[#C5A059]/50 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-[#C5A059] mb-4 group-hover:scale-110 transition-transform shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1.5">
              Smart Citations
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Instantly extract and map relevant judicial precedents,
              cross-referencing past court decisions.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 sm:p-6 rounded-2xl shadow-[0_10px_35px_rgba(30,58,138,0.03)] hover:shadow-[0_15px_40px_rgba(30,58,138,0.06)] hover:border-emerald-200/80 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1.5">
              Verified Precedents
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Highly accurate mappings sourced directly from official High Court
              and Supreme Court records.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 mt-auto border-t border-slate-200/60 bg-white/50 backdrop-blur-md py-6 text-center text-[10px] sm:text-[11px] tracking-wider text-slate-400 uppercase px-4">
        © 2026 LawEase Systems. All Rights Reserved. Powered by Advanced Legal
        Semantics.
      </footer>
    </div>
  );
}
