import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  ShieldCheck,
  X,
} from "lucide-react";
import type { Role } from "../types";
import { useAuth } from "../contexts/AuthContext";

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: Role[];
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard size={18} />,
    roles: ["ADMIN", "CLAIMS_OFFICER"],
  },
  {
    label: "Claims",
    path: "/claims",
    icon: <FileText size={18} />,
    roles: ["ADMIN", "CLAIMS_OFFICER"],
  },
  {
    label: "Users",
    path: "/users",
    icon: <Users size={18} />,
    roles: ["ADMIN"],
  },
  {
    label: "Settings",
    path: "/settings",
    icon: <Settings size={18} />,
    roles: ["ADMIN"],
  },
];

export default function Sidebar({
  isOpen = false,
  onClose = () => {},
}: SidebarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/login", { replace: true });
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-primary-dark text-white flex flex-col h-screen shrink-0 transform transition-transform duration-200 lg:static lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center shrink-0">
              <ShieldCheck size={18} className="text-white" />
            </div>

            <span className="text-base font-bold tracking-wider text-white">
              INSURFLOW
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="p-1.5 rounded-lg text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {navigationItems
          .filter((item) => user && item.roles.includes(user.role))
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-danger/80 hover:text-white transition-all duration-150 w-full"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
