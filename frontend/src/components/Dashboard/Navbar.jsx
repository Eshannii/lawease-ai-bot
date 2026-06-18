import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  MessageSquareCode,
  CircleDollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  Scale,
  Gavel,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const adminNavItems = [
    {
      name: "Dashboard",
      path: "/admin-dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      name: "Users",
      path: "/admin-dashboard/users",
      icon: <Users className="w-4 h-4" />,
    },
    {
      name: "Case Laws",
      path: "/admin-dashboard/case-laws",
      icon: <Gavel className="w-4 h-4" />,
    },
    {
      name: "Chatbot",
      path: "/admin-dashboard/chatbot",
      icon: <MessageSquareCode className="w-4 h-4" />,
    },
    {
      name: "Pricing",
      path: "/admin-dashboard/pricing",
      icon: <CircleDollarSign className="w-4 h-4" />,
    },
    {
      name: "Settings",
      path: "/admin-dashboard/settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const userNavItems = [
    {
      name: "Case Laws",
      path: "/user-dashboard/case-laws",
      icon: <Gavel className="w-4 h-4" />,
    },
    {
      name: "Chatbot",
      path: "/user-dashboard/chatbot",
      icon: <MessageSquareCode className="w-4 h-4" />,
    },
    {
      name: "Settings",
      path: "/user-dashboard/settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const navItems = user?.role === "admin" ? adminNavItems : userNavItems;

  const handleLogout = () => {
    localStorage.removeItem("token");
    logout();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full font-sans antialiased">
      {/* Top Glassmorphic Premium Navbar Bar */}
      <div className="w-full backdrop-blur-md bg-white/90 border-b border-slate-200/80 shadow-[0_4px_20px_rgba(30,58,138,0.04)] px-6 md:px-12 py-3.5 flex items-center justify-between transition-all duration-300">
        {/* Brand Identity / Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="p-1.5 bg-gradient-to-br from-[#1E3A8A] to-[#7A0913] rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-105">
            <Scale className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-[0.05em] text-[#1E3A8A]">
            LawEase <span className="text-[#C5A059] font-semibold">Bot</span>
          </span>
        </div>

        {/* Desktop Navigation Pill */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-100/70 p-1 rounded-full border border-slate-200/50 backdrop-blur-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/admin-dashboard"}
              className={({ isActive }) =>
                `px-4 py-1.5 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5 transition-all duration-200 ${
                  isActive
                    ? "bg-[#7A0913] text-white shadow-[0_4px_12px_rgba(122,9,19,0.15)]"
                    : "text-slate-600 hover:text-[#1E3A8A] hover:bg-white"
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>

        {/* Desktop Logout Button */}
        <div className="hidden md:flex items-center">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold tracking-wider uppercase text-slate-600 hover:text-[#7A0913] bg-slate-50 hover:bg-[#7A0913]/5 border border-slate-200 hover:border-[#7A0913]/20 rounded-full transition-all duration-200 shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>

        {/* Mobile Toggle Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-600 p-2 hover:bg-slate-100 rounded-xl border border-transparent hover:border-slate-200 transition-all duration-200"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel - Enhanced Premium Shadows & Border Contrast */}
      {isMobileMenuOpen && (
        <div className="md:hidden w-full bg-white border-b border-slate-200/90 shadow-[0_15px_30px_rgba(30,58,138,0.08),0_4px_12px_rgba(0,0,0,0.02)] p-5 flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 mb-1">
            Navigation Menu
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/admin-dashboard"}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `w-full px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all ${
                  isActive
                    ? "bg-[#7A0913] text-white shadow-[0_4px_12px_rgba(122,9,19,0.15)]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-[#1E3A8A]"
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}

          <hr className="border-slate-100 my-2" />

          {/* Mobile Logout Action */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              handleLogout();
            }}
            className="w-full px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 text-[#7A0913] hover:bg-[#7A0913]/5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Account</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
