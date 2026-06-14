import React from "react";
import { Scale, MessageSquare } from "lucide-react";
import { Link } from "react-router";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden text-white flex flex-col">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://i.pinimg.com/1200x/da/c3/50/dac35020c364d54b0a9b7637b70b45a6.jpg')",
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70" />

      {/* Accent Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#7A0913]/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 border-b border-white/10 backdrop-blur-md bg-black/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-[#0EA5E9]" />

            <span className="text-lg sm:text-xl font-bold tracking-wider text-white">
              LAWEASE <span className="text-[#E11D48]">BOT</span>
            </span>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="
          px-4 sm:px-6
          py-2.5
          rounded-md
          text-xs
          font-semibold
          uppercase
          tracking-wider
          border
          border-white/20
          bg-white/10
          text-white
          backdrop-blur-md
          hover:bg-white/20
          transition-all
        "
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="
          px-4 sm:px-6
          py-2.5
          rounded-md
          text-xs
          font-semibold
          uppercase
          tracking-wider
          bg-[#7A0913]
          text-white
          hover:bg-[#96121E]
          transition-all
          shadow-lg
        "
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex items-center justify-center">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#0EA5E9] animate-pulse" />

            <span className="text-[10px] sm:text-xs font-medium tracking-[0.25em] text-white/90">
              LAWEASE AI ACTIVE • COURT PRECEDENT MODE
            </span>
          </div>

          {/* Heading */}
          <h1
            className="
              text-5xl
              sm:text-6xl
              md:text-7xl
              lg:text-8xl
              xl:text-9xl
              font-extralight
              leading-[0.95]
              tracking-tight
              mb-8
              text-white
              drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]
            "
          >
            LEGAL AI
            <br />
            <span className="font-serif italic font-normal text-[#F8D7DA]">
              ASSISTANT
            </span>
          </h1>

          {/* Description */}
          <p
            className="
              max-w-2xl
              mx-auto
              text-sm
              sm:text-base
              md:text-lg
              lg:text-xl
              text-white/85
              leading-relaxed
              mb-12
            "
          >
            Instant retrieval and context-aware summarization across vast
            judicial precedents. Chat with{" "}
            <span className="text-[#38BDF8] font-semibold">LawEase Bot</span>{" "}
            for swift case law research and legal intelligence.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              className="
                w-full
                sm:w-auto
                bg-[#7A0913]
                hover:bg-[#96121E]
                px-8
                sm:px-10
                py-4
                rounded-md
                text-sm
                font-semibold
                tracking-wider
                uppercase
                transition-all
                hover:-translate-y-1
                shadow-xl
              "
            >
              Launch Bot Interface
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 border-t border-white/10 bg-black/10 backdrop-blur-md py-5 text-center text-xs text-white/60">
        © 2026 LawEase Systems. Powered by Advanced Legal Semantics.
      </footer>
    </div>
  );
}
