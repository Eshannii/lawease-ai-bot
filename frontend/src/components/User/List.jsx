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
  SlidersHorizontal,
  Activity,
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

  // Date fix: Corrected parsing and formatting
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";

    return d.toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const adminCount = users.filter((u) => u.role === "admin").length;
  const userCount = users.filter((u) => u.role === "user").length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 px-4 sm:px-6 md:px-10 pb-12 text-slate-700 font-sans antialiased relative overflow-x-hidden">
      {/* Premium Luxury Ambient Backdrops */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-12 right-12 w-[600px] h-[600px] bg-gradient-to-br from-blue-200/20 to-indigo-100/30 rounded-full blur-[140px] opacity-80" />
        <div className="absolute top-1/4 -left-20 w-[450px] h-[450px] bg-gradient-to-tr from-[#7A0913]/5 to-amber-100/20 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-10 right-1/3 w-[500px] h-[500px] bg-sky-100/40 rounded-full blur-[130px] opacity-50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Professional Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/60 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#1E3A8A] uppercase">
              <Activity className="w-3.5 h-3.5" />
              <span>LawEase Management System</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              User Directory{" "}
              <span className="font-serif italic font-normal text-[#7A0913]">
                Records
              </span>
            </h1>
            <p className="text-slate-400 text-xs font-light">
              Manage system permissions, user accounts, and credentials for the
              law firm.
            </p>
          </div>

          {/* Live Status Pill */}
          <div className="self-start md:self-center flex items-center gap-2 bg-white border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] px-4 py-2 rounded-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold text-slate-600 tracking-wide uppercase">
              Total Found: {filteredUsers.length} Records
            </span>
          </div>
        </div>

        {/* Clean Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Card 1: Total Users */}
          <div className="relative group bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_10px_30px_rgba(30,58,138,0.015)] transition-all duration-300 hover:shadow-[0_15px_35px_rgba(30,58,138,0.04)] hover:-translate-y-0.5 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-slate-400 to-slate-600" />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">
                  Total Registered Accounts
                </p>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">
                  {users.length}
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 group-hover:text-slate-700 transition-colors">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Card 2: Admins */}
          <div className="relative group bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_10px_30px_rgba(30,58,138,0.015)] transition-all duration-300 hover:shadow-[0_15px_35px_rgba(197,160,89,0.08)] hover:-translate-y-0.5 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#C5A059] to-amber-300" />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] text-[#C5A059] uppercase tracking-widest font-extrabold">
                  System Administrators
                </p>
                <p className="text-3xl font-black text-[#C5A059] tracking-tighter">
                  {adminCount}
                </p>
              </div>
              <div className="p-3 bg-amber-50/40 border border-amber-100/50 rounded-xl text-[#C5A059]">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Card 3: Standard Clients */}
          <div className="relative group bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_10px_30px_rgba(30,58,138,0.015)] transition-all duration-300 hover:shadow-[0_15px_35px_rgba(122,9,19,0.06)] hover:-translate-y-0.5 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#7A0913] to-red-400" />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] text-[#7A0913] uppercase tracking-widest font-extrabold">
                  Active Lawyers / Staff
                </p>
                <p className="text-3xl font-black text-[#7A0913] tracking-tighter">
                  {userCount}
                </p>
              </div>
              <div className="p-3 bg-red-50/50 border border-red-100/40 rounded-xl text-[#7A0913]">
                <UserRound className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filtering Panel */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-[#1E3A8A]" />
            <input
              type="text"
              placeholder="Search by user name or email address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-sm pl-10 pr-4 py-2.5 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 transition-all duration-200"
            />
          </div>

          <div className="w-full sm:w-auto flex items-center justify-end gap-2">
            <button
              onClick={fetchUsers}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-[#7A0913] transition-all active:scale-95 shadow-sm flex items-center gap-2 font-bold text-xs"
              title="Refresh Records"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sync Table</span>
            </button>
          </div>
        </div>

        {/* Main Render Block */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-72 space-y-3">
            <div className="w-8 h-8 border-3 border-[#7A0913] border-t-transparent rounded-full animate-spin" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 animate-pulse">
              Loading User Directory...
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-72 border border-dashed border-slate-200 bg-white rounded-2xl text-slate-400 shadow-[inset_0_4px_12px_rgba(0,0,0,0.01)]">
            <div className="p-4 bg-slate-50 rounded-full border border-slate-100 mb-3 text-slate-300">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold tracking-wide text-slate-500">
              No Matching Records Found
            </p>
            <p className="text-[11px] font-light text-slate-400 mt-0.5">
              Try altering your search keywords.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-[0_12px_40px_rgba(30,58,138,0.03)]">
              <table className="w-full text-xs text-slate-600 border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-400 text-[10px] font-extrabold uppercase tracking-widest">
                    <th className="px-6 py-4 text-left w-12 text-slate-400">
                      #
                    </th>
                    <th className="px-6 py-4 text-left">Full Name</th>
                    <th className="px-6 py-4 text-left">Email Address</th>
                    <th className="px-6 py-4 text-left">Access Role</th>
                    <th className="px-6 py-4 text-left">Account Created</th>
                    <th className="px-6 py-4 text-center w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredUsers.map((user, index) => (
                    <tr
                      key={user._id}
                      className="group bg-white hover:bg-slate-50/40 transition-all duration-150"
                    >
                      <td className="px-6 py-4 text-slate-300 font-bold text-[11px]">
                        {String(index + 1).padStart(2, "0")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs uppercase shrink-0 tracking-wider shadow-sm transition-transform duration-200 group-hover:scale-105 ${
                              user.role === "admin"
                                ? "bg-amber-50 text-[#C5A059] border border-amber-200/60"
                                : "bg-red-50 text-[#7A0913] border border-red-200/50"
                            }`}
                          >
                            {user.name?.charAt(0)}
                          </div>
                          <span className="text-slate-900 font-bold tracking-tight text-sm">
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-[11px] tracking-tight">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 transition-colors shrink-0" />
                          <span>{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.role === "admin" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold bg-gradient-to-r from-amber-50 to-amber-100/50 text-[#C5A059] border border-amber-200/50 shadow-sm">
                            <ShieldCheck className="w-3 h-3 text-[#C5A059]" />
                            ADMINISTRATOR
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-200/80 shadow-sm">
                            <UserRound className="w-3 h-3 text-slate-400" />
                            STAFF MEMBER
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-[11px] font-sans">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-300" />
                          <span>{formatDate(user.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDelete(user._id)}
                          disabled={
                            deletingId === user._id || user.role === "admin"
                          }
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all duration-150 disabled:opacity-10 disabled:cursor-not-allowed disabled:hover:bg-transparent"
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

            {/* Mobile View Card Sheet */}
            <div className="md:hidden flex flex-col gap-4">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="relative group bg-white border border-slate-200 rounded-2xl p-4.5 flex flex-col gap-4 shadow-[0_4px_15px_rgba(0,0,0,0.015)] overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs uppercase shadow-sm shrink-0 ${
                          user.role === "admin"
                            ? "bg-amber-50 text-[#C5A059] border border-amber-200/60"
                            : "bg-red-50 text-[#7A0913] border border-red-200/50"
                        }`}
                      >
                        {user.name?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-slate-900 font-bold text-sm tracking-tight truncate">
                          {user.name}
                        </p>
                        <p className="text-slate-400 font-mono text-[11px] tracking-tight truncate flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-300" />
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(user._id)}
                      disabled={
                        deletingId === user._id || user.role === "admin"
                      }
                      className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-100 hover:border-red-100 transition-all shrink-0 disabled:opacity-10"
                    >
                      {deletingId === user._id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100/80 pt-3.5">
                    <div>
                      {user.role === "admin" ? (
                        <span className="px-2.5 py-0.5 rounded-md text-[9px] font-black bg-amber-50 text-[#C5A059] border border-amber-200/60 tracking-wider">
                          ADMIN
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-md text-[9px] font-bold bg-slate-50 text-slate-500 border border-slate-200/80 tracking-wider">
                          STAFF
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-slate-400 text-[10px] font-medium font-sans">
                      <Calendar className="w-3 h-3 text-slate-300" />
                      <span>{formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default List;
