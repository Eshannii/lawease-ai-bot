import { useState } from "react";
import axios from "axios";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

const API_BASE = "https://lawease-ai-bot-production.up.railway.app";

const Setting = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: "success" | "error", text: string }

  const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "Please fill in all fields." });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "New password must be at least 6 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put(
        `${API_BASE}/api/auth/change-password`,
        { currentPassword, newPassword },
        { headers: getAuthHeader() },
      );

      setMessage({
        type: "success",
        text: res.data.message || "Password updated successfully.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.error ||
          "Failed to update password. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen pt-19 bg-[#0B0F19] text-slate-200 antialiased px-4 md:px-12 lg:px-24 xl:px-32 pb-12">
      <div className="w-full max-w-2xl mx-auto">
        <h2 className="text-lg font-semibold text-slate-200 tracking-wide mb-1">
          Account Settings
        </h2>
        <p className="text-sm text-slate-500 mb-8">
          Manage your account security preferences.
        </p>

        <div className="bg-[#1E293B] border border-slate-800/80 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.3)] p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#0F172A] border border-slate-700/60 flex items-center justify-center text-[#C5A059] shrink-0">
              <Lock size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200 tracking-wide">
                Change Password
              </h3>
              <p className="text-xs text-slate-500">
                Update your password to keep your account secure.
              </p>
            </div>
          </div>

          {message && (
            <div
              className={`flex items-center gap-2 text-xs font-medium rounded-xl px-4 py-3 mb-5 border ${
                message.type === "success"
                  ? "bg-emerald-950/40 border-emerald-800/50 text-emerald-400"
                  : "bg-red-950/40 border-red-800/50 text-red-400"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 size={14} className="shrink-0" />
              ) : (
                <AlertCircle size={14} className="shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-[#0F172A] border border-slate-700/80 focus:border-blue-500/80 text-slate-200 placeholder-slate-600 text-sm rounded-xl px-4 py-3 pr-11 outline-none transition-all focus:ring-2 focus:ring-blue-900/30 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-[#0F172A] border border-slate-700/80 focus:border-blue-500/80 text-slate-200 placeholder-slate-600 text-sm rounded-xl px-4 py-3 pr-11 outline-none transition-all focus:ring-2 focus:ring-blue-900/30 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-[#0F172A] border border-slate-700/80 focus:border-blue-500/80 text-slate-200 placeholder-slate-600 text-sm rounded-xl px-4 py-3 pr-11 outline-none transition-all focus:ring-2 focus:ring-blue-900/30 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full sm:w-auto sm:self-end px-6 py-3 bg-[#7A0913] text-white rounded-xl text-sm font-medium hover:bg-[#92141D] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(122,9,19,0.2)]"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Setting;
