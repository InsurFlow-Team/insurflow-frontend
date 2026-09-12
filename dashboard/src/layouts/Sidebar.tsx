import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import type { Role } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { userInitials } from "../utils/user";

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: Role[];
  end?: boolean;
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navigationItems: NavigationItem[] = [
  {
    label: "Overview",
    path: "/dashboard",
    icon: <LayoutDashboard size={18} />,
    roles: ["ADMIN", "CLAIMS_OFFICER"],
  },
  {
    label: "Claims Queue",
    path: "/claims",
    icon: <FileText size={18} />,
    roles: ["ADMIN", "CLAIMS_OFFICER"],
  },
];

const settingsParent: NavigationItem = {
  label: "Settings",
  path: "/settings",
  icon: <Settings size={18} />,
  roles: ["ADMIN"],
  end: true,
};

const settingsChildren: NavigationItem[] = [
  {
    label: "User Management",
    path: "/settings/users",
    icon: <Users size={18} />,
    roles: ["ADMIN"],
  },
];

function navLinkClass(isActive: boolean) {
  return `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
    isActive
      ? "bg-blue-50 text-primary"
      : "text-gray-500 hover:bg-gray-50 hover:text-primary"
  }`;
}

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
      className={`fixed inset-y-0 left-0 z-40 w-[280px] bg-surface border-r border-border flex flex-col h-screen shrink-0 transform transition-transform duration-200 lg:static lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Product header */}
      <div className="px-5 py-6 border-b border-border">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <ShieldCheck size={20} className="text-white" />
            </div>

            <div className="min-w-0">
              <span className="block text-base font-bold text-text tracking-tight leading-tight">
                InsurFlow
              </span>
              <span className="block text-xs text-text-muted">
                Enterprise Operations
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="p-1.5 rounded-lg text-text-muted hover:bg-gray-50 hover:text-text lg:hidden"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        <div className="space-y-1">
          {navigationItems
            .filter((item) => user && item.roles.includes(user.role))
            .map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) => navLinkClass(isActive)}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-primary rounded-r-full" />
                    )}
                    {item.icon}
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
        </div>

        <div className="mt-6">
          <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
            Settings
          </p>

          {user && settingsParent.roles.includes(user.role) && (
            <NavLink
              to={settingsParent.path}
              end={settingsParent.end}
              onClick={onClose}
              className={({ isActive }) => navLinkClass(isActive)}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-primary rounded-r-full" />
                  )}
                  {settingsParent.icon}
                  <span>{settingsParent.label}</span>
                </>
              )}
            </NavLink>
          )}

          <div className="mt-1 ml-3 border-l border-border pl-1.5 space-y-1">
            {settingsChildren
              .filter((item) => user && item.roles.includes(user.role))
              .map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) => navLinkClass(isActive)}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-primary rounded-r-full" />
                      )}
                      <span className="w-[18px] shrink-0 flex justify-center">
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
          </div>
        </div>
      </nav>

      {/* Current user card */}
      <div className="px-3 py-3 border-t border-border">
        <div className="rounded-xl bg-primary px-3 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {userInitials(user?.name ?? "")}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.name ?? "User"}
            </p>
            <p className="text-xs text-white/60 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
              <span className="truncate">
                {user?.role.replace(/_/g, " ") ?? "—"} • v4.18.2 • Live
              </span>
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-danger-bg hover:text-danger transition-colors duration-150 w-full"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}