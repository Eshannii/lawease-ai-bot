import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Trash2,
  ShieldCheck,
  UserRound,
  RefreshCw,
  Calendar,
  Mail,
} from "lucide-react";
import axios from "axios";

const List = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "https://lawease-ai-bot-production.up.railway.app/api/users",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setUsers(data.users);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `https://lawease-ai-bot-production.up.railway.app/api/users/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr, id) => {
    if (dateStr) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-PK", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
    }
    if (id) {
      const timestamp = parseInt(id.substring(0, 8), 16) * 1000;
      const d = new Date(timestamp);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-PK", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
    }
    return "—";
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const adminCount = users.filter((u) => u.role === "admin").length;
  const userCount = users.filter((u) => u.role === "user").length;

  return (
    /* Main Layout Viewport Container: Matching LawEase Bot Dark Luxury Theme */
    <div className="min-h-screen bg-[#0B0F19] pt-24 px-6 md:px-10 pb-10 text-slate-200 antialiased">
      {/* Page Header */}
      <div className="mb-8 border-b border-slate-800/60 pb-5">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2.5 tracking-wide">
          <Users className="w-5 h-5 text-[#C5A059]" />
          Registered Users
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Manage all accounts on LawEase Management Platform
        </p>
      </div>

      {/* Stats Row with Subtle Inner Depths */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#1E293B]/60 border border-slate-800/80 rounded-2xl px-5 py-4 shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">
            Total Accounts
          </p>
          <p className="text-2xl font-bold text-white tracking-tight">
            {users.length}
          </p>
        </div>
        <div className="bg-[#1E293B]/60 border border-slate-800/80 rounded-2xl px-5 py-4 shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
          <p className="text-[10px] text-[#C5A059] uppercase tracking-widest font-semibold mb-1">
            Admins
          </p>
          <p className="text-2xl font-bold text-[#C5A059] tracking-tight">
            {adminCount}
          </p>
        </div>
        <div className="bg-[#1E293B]/60 border border-slate-800/80 rounded-2xl px-5 py-4 shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
          <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-semibold mb-1">
            Users / Clients
          </p>
          <p className="text-2xl font-bold text-emerald-400 tracking-tight">
            {userCount}
          </p>
        </div>
      </div>

      {/* Search + Refresh Action Row */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm shadow-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#161B26] text-slate-200 placeholder-slate-600 text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500/80 focus:ring-2 focus:ring-blue-900/30 transition-all"
          />
        </div>
        <button
          onClick={fetchUsers}
          className="p-2.5 rounded-xl bg-[#161B26] border border-slate-800 text-slate-400 hover:text-[#C5A059] hover:border-[#C5A059]/40 transition-all shadow-sm"
          title="Refresh User Directory"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <span className="text-slate-500 text-[11px] font-medium tracking-wide ml-1">
          {filteredUsers.length} profile{filteredUsers.length !== 1 && "s"}{" "}
          matched
        </span>
      </div>

      {/* Error Boundary Notice */}
      {error && (
        <div className="bg-red-950/20 border border-red-900/40 text-red-400 text-xs p-4 rounded-xl mb-5 shadow-sm">
          {error}
        </div>
      )}

      {/* Main Data Render Canvas */}
      {loading ? (
        <div className="flex items-center justify-center h-60">
          <div className="w-7 h-7 border-2 border-[#7A0913] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 text-slate-600 border border-dashed border-slate-800/80 rounded-2xl bg-[#161B26]/30">
          <Users className="w-10 h-10 mb-3 opacity-20 text-slate-400" />
          <p className="text-xs tracking-wide">No active user records found</p>
        </div>
      ) : (
        <>
          {/* Desktop Matrix Grid View */}
          <div className="hidden md:block rounded-2xl border border-slate-800/80 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.25)] bg-[#111622]">
            <table className="w-full text-xs text-slate-300">
              <thead>
                <tr className="bg-[#1E293B] text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-800/80">
                  <th className="px-6 py-4 text-left w-12 font-semibold">#</th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Legal Name
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Email Endpoint
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    System Role
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Registration Date
                  </th>
                  <th className="px-6 py-4 text-center w-20 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user._id}
                    className="bg-[#0E1219]/60 hover:bg-[#1E293B]/40 transition-colors"
                  >
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs uppercase shrink-0 shadow-sm ${
                            user.role === "admin"
                              ? "bg-amber-500/10 border border-amber-500/20 text-[#C5A059]"
                              : "bg-[#7A0913]/20 border border-[#7A0913]/30 text-red-400"
                          }`}
                        >
                          {user.name?.charAt(0)}
                        </div>
                        <span className="text-slate-200 font-medium tracking-wide">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-400 tracking-wide">
                        <Mail className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === "admin" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-[#C5A059] border border-amber-500/20 shadow-sm">
                          <ShieldCheck className="w-3 h-3" />
                          Administrator
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-950/40 text-blue-400 border border-blue-900/30 shadow-sm">
                          <UserRound className="w-3 h-3" />
                          Standard Client
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-600" />
                        {formatDate(user.createdAt, user._id)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(user._id)}
                        disabled={
                          deletingId === user._id || user.role === "admin"
                        }
                        title={
                          user.role === "admin"
                            ? "Protected Root Account"
                            : "Purge User Profile"
                        }
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-[#7A0913]/10 transition-all disabled:opacity-25 disabled:cursor-not-allowed"
                      >
                        {deletingId === user._id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Responsive Mobile Cards Sheet */}
          <div className="md:hidden flex flex-col gap-3">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                className="bg-[#111622] border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase shadow-sm ${
                      user.role === "admin"
                        ? "bg-amber-500/10 border border-amber-500/20 text-[#C5A059]"
                        : "bg-[#7A0913]/20 border border-[#7A0913]/30 text-red-400"
                    }`}
                  >
                    {user.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-slate-200 font-medium text-xs tracking-wide">
                      {user.name}
                    </p>
                    <p className="text-slate-500 text-[11px] tracking-wide">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {user.role === "admin" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-500/10 text-[#C5A059] border border-amber-500/20">
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-blue-950/40 text-blue-400 border border-blue-900/30">
                          Client
                        </span>
                      )}
                      <span className="text-slate-600 text-[9px] font-medium">
                        {formatDate(user.createdAt, user._id)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(user._id)}
                  disabled={deletingId === user._id || user.role === "admin"}
                  className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-[#7A0913]/10 transition-all disabled:opacity-25 disabled:cursor-not-allowed"
                >
                  {deletingId === user._id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default List;
