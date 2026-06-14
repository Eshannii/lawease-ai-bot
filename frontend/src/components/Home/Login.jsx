import React, { useState } from "react";
import { User, Lock, Scale } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import axios from "axios";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data } = await axios.post(
        "https://lawease-ai-bot-production.up.railway.app/api/auth/login",
        {
          email,
          password,
        },
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
    }
  };

  return (
    <div className="w-full min-h-screen relative flex items-center justify-center font-sans antialiased bg-[#0B0F17]">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat brightness-[0.25] blur-[2px]"
        style={{
          backgroundImage:
            "url('https://i.pinimg.com/736x/76/4a/33/764a33f17c92b99ab92ee9743e9886d3.jpg')",
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-112.5 aspect-4/5 rounded-3xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] border border-gray-800/50 flex flex-col relative z-10 bg-[#161B26]">
        {/* Header */}
        <div className="relative h-[42%] w-full flex flex-col items-center justify-center px-8 text-center bg-linear-to-b from-[#1E293B]/60 to-[#111827]/90 border-b border-gray-800/40">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#7A0913]/10 blur-xl rounded-full pointer-events-none" />

          <div className="flex items-center space-x-2 relative z-10 mb-3">
            <Scale className="h-6 w-6 text-[#0EA5E9]" />
            <span className="text-xl font-bold tracking-wider text-white">
              LAWEASE <span className="text-[#A81A28]">BOT</span>
            </span>
          </div>

          <h2 className="text-2xl font-light tracking-tight text-white mb-2">
            LEGAL AI{" "}
            <span className="font-serif italic font-normal text-[#A81A28]">
              ASSISTANT
            </span>
          </h2>

          <p className="text-[11px] text-gray-400 font-light max-w-70 leading-relaxed">
            Instant retrieval and context-aware summarization across vast
            judicial precedents.
          </p>

          <div className="mt-4 bg-black/40 border border-gray-800 px-3 py-1 rounded-full text-[9px] font-mono tracking-wider font-semibold text-[#0EA5E9] flex items-center space-x-1.5 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9] animate-pulse"></span>
            <span>COURT PRECEDENT MODE</span>
          </div>
        </div>

        {/* Form Section */}
        <div className="flex-1 w-full bg-[#11151F] px-8 pt-8 pb-6">
          <div className="text-center mb-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-400">
              Login To Your Account
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <User className="h-4 w-4 text-gray-500" />
              </span>

              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#161B26] text-gray-200 placeholder-gray-500 text-sm pl-11 pr-4 py-3.5 rounded-xl border border-gray-800 focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9]/30 transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Lock className="h-4 w-4 text-gray-500" />
              </span>

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#161B26] text-gray-200 placeholder-gray-500 text-sm pl-11 pr-4 py-3.5 rounded-xl border border-gray-800 focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9]/30 transition-all duration-200"
              />
            </div>

            {/* Links */}
            <div className="flex items-center justify-between text-xs pt-1 px-1">
              <Link
                to="/"
                className="text-gray-400 hover:text-gray-300 transition"
              >
                Go to Home Page
              </Link>

              <Link
                to="/signup"
                className="text-[#A81A28] hover:text-[#C92A3A] transition-colors duration-200 font-medium"
              >
                Don't have an account? Sign Up
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-4 w-full bg-[#7A0913] text-white font-semibold py-3.5 rounded-xl text-sm tracking-wider uppercase hover:bg-[#96121E] active:scale-[0.99] transition-all duration-200 shadow-[0_8px_20px_-6px_rgba(122,9,19,0.5)]"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
