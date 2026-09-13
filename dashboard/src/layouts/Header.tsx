import { type KeyboardEvent, useRef, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Menu, UserRound } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface HeaderProps {
  onMenuClick?: () => void;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/claims": "Claims Queue",
  "/profile": "Profile",
  "/settings": "Settings",
  "/settings/users": "User Management",
};

export default function Header({ onMenuClick = () => {} }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);

  const title =
    pageTitles[location.pathname] ??
    (location.pathname.startsWith("/claims/") ? "Claim Details" : "Overview");
  const userInitial = user?.name.charAt(0).toUpperCase() ?? "U";

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  function handleMenuKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      setMenuOpen(false);
      menuTriggerRef.current?.focus();
      return;
    }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;

    e.preventDefault();
    const panel = menuRef.current;
    if (!panel) return;
    const items = Array.from(
      panel.querySelectorAll<HTMLElement>('[role="menuitem"]'),
    );
    if (items.length === 0) return;

    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    const nextIndex =
      e.key === "ArrowDown"
        ? (currentIndex + 1) % items.length
        : (currentIndex - 1 + items.length) % items.length;
    items[nextIndex].focus();
  }

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="h-16 bg-surface border-b border-border px-4 sm:px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open sidebar"
          className="p-2 -ml-2 text-text-muted hover:text-text hover:bg-background rounded-lg transition-colors lg:hidden"
        >
          <Menu size={21} />
        </button>

        <h1 className="text-lg font-semibold text-text truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative p-2 text-text-muted hover:text-text hover:bg-background rounded-lg transition-colors"
        >
          <Bell size={19} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
        </button>

        <div className="w-px h-7 bg-border" />

        {/* User menu */}
        <div ref={menuRef} className="relative">
          <button
            ref={menuTriggerRef}
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2.5 rounded-lg p-1.5 -m-1.5 hover:bg-background transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm shrink-0">
              {userInitial}
            </div>

            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-semibold text-text leading-tight">
                {user?.name ?? "User"}
              </span>
              <div className="flex items-center gap-1.5 text-xs leading-tight">
                <span className="text-accent font-medium">
                  {user?.role.replace(/_/g, " ")}
                </span>
                <span className="text-text-muted">•</span>
                <span className="text-text-muted max-w-36 truncate">
                  {user?.organizationName}
                </span>
                {user?.employeeCode && (
                  <>
                    <span className="text-text-muted">•</span>
                    <span className="text-text-muted">{user.employeeCode}</span>
                  </>
                )}
              </div>
            </div>

            <ChevronDown
              size={14}
              className={`hidden sm:block text-text-muted transition-transform ${menuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {menuOpen && (
            <div
              role="menu"
              onKeyDown={handleMenuKeyDown}
              className="absolute right-0 top-full mt-2 w-64 bg-surface border border-border rounded-xl shadow-lg p-4 z-50"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
                  {userInitial}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-text-muted">{user?.employeeCode}</p>
                </div>
              </div>

              <div className="text-xs text-text-muted mb-3 space-y-1">
                <p>
                  Role:{" "}
                  <span className="text-accent font-medium">
                    {user?.role.replace(/_/g, " ")}
                  </span>
                </p>
                <p>Org: {user?.organizationName}</p>
              </div>

              <div className="border-t border-border pt-3">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
                  className="flex items-center gap-2 w-full text-sm text-text hover:text-primary hover:bg-background rounded-lg px-3 py-2 transition-colors"
                >
                  <UserRound size={15} />
                  Profile
                </button>
              </div>

              <div className="border-t border-border pt-3">
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full text-sm text-text hover:text-danger hover:bg-background rounded-lg px-3 py-2 transition-colors"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
