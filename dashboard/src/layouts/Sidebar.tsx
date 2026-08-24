import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import type { Role } from "../types";

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: Role[];
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

export default function Sidebar() {
  const currentRole: Role = "ADMIN"; // مؤقت

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <FileText size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-wide text-white">
            INSURFLOW
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigationItems
          .filter((item) => item.roles.includes(currentRole))
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-700">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-600 hover:text-white transition-all duration-150 w-full">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
