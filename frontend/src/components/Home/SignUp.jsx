import React, { useState } from "react";
import { User, Lock, Scale, Mail, ArrowRight, Bot } from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; // Keeps your project router consistency
import { useAuth } from "../../context/authContext";
import axios from "axios";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        "https://lawease-ai-bot-production.up.railway.app/api/auth/register",
        { name, email, password },
      );

      if (data.success) {
        localStorage.setItem("token", data.token);
        login(data.user);

        if (data.user.role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/user-dashboard/chatbot");
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F6F8FA] text-slate-800 flex items-center justify-center font-sans antialiased overflow-x-hidden selection:bg-[#7A0913]/10 selection:text-[#7A0913] px-4 py-8 sm:py-12">
      {/* Cohesive Luxury Ambient Background (Matched with Login/Home) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Soft Left Side Indigo Dynamic Glow */}
        <div className="absolute top-1/4 -left-40 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-indigo-100/60 rounded-full blur-[80px] sm:blur-[140px] opacity-70" />

        {/* Rich Right Side Soft Blue Blur */}
        <div className="absolute -top-20 -right-20 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-blue-100/60 rounded-full blur-[80px] sm:blur-[140px] opacity-70" />

        {/* Semantic Fine Tech Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-30" />
      </div>

      {/* Main Signup Card - Premium Shadow & Fluid Width */}
      <div className="relative z-10 w-full max-w-[460px] bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(30,58,138,0.08)] overflow-hidden flex flex-col my-4">
        {/* Top Header Panel */}
        <div className="relative pt-8 pb-6 px-6 sm:px-10 text-center border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[#1E3A8A]/5 blur-xl rounded-full pointer-events-none" />

          {/* Brand Identity */}
          <div
            className="flex items-center justify-center gap-2 relative z-10 mb-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="p-1.5 bg-gradient-to-br from-[#1E3A8A] to-[#7A0913] rounded-lg shadow-sm">
              <Scale className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-[0.15em] text-[#1E3A8A]">
              LAWEASE <span className="text-[#C5A059] font-semibold">BOT</span>
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-xl sm:text-2xl font-light tracking-tight text-slate-900 mb-1.5 relative z-10">
            Create Your{" "}
            <span className="font-serif italic font-normal bg-gradient-to-r from-[#7A0913] to-[#1E3A8A] bg-clip-text text-transparent block sm:inline">
              Professional Account
            </span>
          </h2>

          <p className="text-[11px] text-slate-400 font-light max-w-xs mx-auto leading-relaxed relative z-10">
            Join LawEase Bot to gain instant access to context-aware
            conversational jurisprudence analysis.
          </p>

          {/* Precedent Mode Badge */}
          <div className="mt-3.5 inline-flex items-center gap-1.5 bg-blue-50/60 border border-blue-100/70 px-3 py-1 rounded-full text-[9px] font-sans tracking-wider font-bold text-[#1E3A8A] backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse"></span>
            <span>COURT PRECEDENT MODE</span>
          </div>
        </div>

        {/* Form Interactive Input Section */}
        <div className="px-6 sm:px-10 py-6 sm:py-8 bg-white">
          <form onSubmit={handleSubmit} className="space-y-3.5 flex flex-col">
            {/* Error Message Panel */}
            {error && (
              <div className="bg-[#7A0913]/5 border border-[#7A0913]/20 text-[#7A0913] text-xs p-3.5 rounded-xl font-medium tracking-wide">
                {error}
              </div>
            )}

            {/* Full Name Field */}
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 transition-colors group-focus-within:text-[#1E3A8A]">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-50/50 text-slate-700 placeholder-slate-400 text-xs sm:text-sm pl-11 pr-4 py-3 sm:py-3.5 rounded-xl border border-slate-200/80 focus:bg-white focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100/50 transition-all duration-200"
              />
            </div>

            {/* Email Field */}
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 transition-colors group-focus-within:text-[#1E3A8A]">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50/50 text-slate-700 placeholder-slate-400 text-xs sm:text-sm pl-11 pr-4 py-3 sm:py-3.5 rounded-xl border border-slate-200/80 focus:bg-white focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100/50 transition-all duration-200"
              />
            </div>

            {/* Password Field */}
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 transition-colors group-focus-within:text-[#1E3A8A]">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50/50 text-slate-700 placeholder-slate-400 text-xs sm:text-sm pl-11 pr-4 py-3 sm:py-3.5 rounded-xl border border-slate-200/80 focus:bg-white focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100/50 transition-all duration-200"
              />
            </div>

            {/* Confirm Password Field */}
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 transition-colors group-focus-within:text-[#1E3A8A]">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-slate-50/50 text-slate-700 placeholder-slate-400 text-xs sm:text-sm pl-11 pr-4 py-3 sm:py-3.5 rounded-xl border border-slate-200/80 focus:bg-white focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100/50 transition-all duration-200"
              />
            </div>

            {/* Clean Functional Links - Responsive Breakpoints */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] pt-1 gap-2 px-0.5">
              <Link
                to="/"
                className="text-slate-400 hover:text-[#1E3A8A] font-medium transition-colors"
              >
                ← Back to Home Page
              </Link>

              <Link
                to="/login"
                className="text-[#7A0913] hover:text-[#91131E] font-semibold transition-colors tracking-wide"
              >
                Already have an account? Login
              </Link>
            </div>

            {/* Premium Submit Button with Loading Handle */}
            <button
              type="submit"
              disabled={loading}
              className="group mt-4 w-full bg-gradient-to-r from-[#7A0913] to-[#91131E] hover:from-[#61040b] hover:to-[#7A0913] text-white font-bold py-3.5 rounded-xl text-xs tracking-widest uppercase transition-all shadow-[0_8px_25px_rgba(122,9,19,0.15)] hover:shadow-[0_10px_30px_rgba(122,9,19,0.25)] flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{loading ? "Registering..." : "Create Account"}</span>
              {!loading && (
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              )}
            </button>
          </form>
        </div>

        {/* Footer Area inside Card */}
        <div className="py-4 bg-slate-50/60 border-t border-slate-100 text-center text-[10px] text-slate-400 font-medium tracking-wider uppercase">
          Secure Registration Infrastructure
        </div>
      </div>
    </div>
  );
}
