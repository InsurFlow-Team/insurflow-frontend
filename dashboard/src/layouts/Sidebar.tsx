import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import NavItem from "./sidebar/NavItem";
import SidebarUserCard from "./sidebar/SidebarUserCard";
import {
  navigationItems,
  settingsChildren,
  settingsParent,
} from "./sidebar/navigation.tsx";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  isOpen = false,
  onClose = () => {},
}: SidebarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Escape closes the mobile drawer.
  useEffect(() => {
    if (!isOpen) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/login", { replace: true });
  };

  const visibleNavigationItems = navigationItems.filter(
    (item) => user && item.roles.includes(user.role),
  );

  return (
    <aside
      aria-label="Primary navigation"
      className={`fixed inset-y-0 left-0 z-40 w-[280px] bg-surface border-r border-border flex flex-col h-screen shrink-0 transform transition-[transform,visibility] duration-200 lg:static lg:translate-x-0 lg:visible ${
        isOpen ? "translate-x-0 visible" : "-translate-x-full invisible"
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
          {visibleNavigationItems.map((item) => (
            <NavItem key={item.path} item={item} onNavigate={onClose} />
          ))}
        </div>

        {user && settingsParent.roles.includes(user.role) && (
          <div className="mt-6">
            <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              Settings
            </p>

            <NavItem item={settingsParent} onNavigate={onClose} />

            <div className="mt-1 ml-3 border-l border-border pl-1.5 space-y-1">
              {settingsChildren
                .filter((item) => item.roles.includes(user.role))
                .map((item) => (
                  <NavItem
                    key={item.path}
                    item={item}
                    onNavigate={onClose}
                    indent
                  />
                ))}
            </div>
          </div>
        )}
      </nav>

      <SidebarUserCard
        userName={user?.name ?? "User"}
        userRole={user?.role ?? "—"}
        onLogout={handleLogout}
      />
    </aside>
  );
}