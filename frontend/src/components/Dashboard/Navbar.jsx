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
    <nav className="fixed top-0 left-0 right-0 z-50 w-full">
      <div className="w-full backdrop-blur-xl bg-[#1a2035]/90 border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.2)] px-6 md:px-12 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <Scale className="h-6 w-6 text-sky-400 transition-transform group-hover:rotate-12 duration-300" />
          <span className="text-xl font-bold tracking-tight text-slate-100">
            LawEase{" "}
            <span className="text-[#ff4d6d] font-bold text-base">Bot</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 bg-white/[0.06] p-1 rounded-full border border-white/[0.04]">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/admin-dashboard"}
              className={({ isActive }) =>
                `px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
                  isActive
                    ? "bg-[#840a23] text-white shadow-lg shadow-black/20"
                    : "text-slate-300 hover:text-white hover:bg-white/[0.08]"
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </div>

        {/* Desktop Logout */}
        <div className="hidden md:flex items-center">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-slate-100 bg-[#840a23]/80 hover:bg-[#840a23] border border-white/[0.1] hover:border-white/[0.2] rounded-full shadow-md shadow-black/10 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-200 p-1.5 hover:bg-white/[0.08] rounded-lg"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden w-full backdrop-blur-2xl bg-[#1a2035]/98 border-b border-white/[0.08] shadow-2xl p-5 flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/admin-dashboard"}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `w-full px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${
                  isActive
                    ? "bg-[#840a23] text-white"
                    : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}

          <hr className="border-white/[0.06] my-2" />

          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
