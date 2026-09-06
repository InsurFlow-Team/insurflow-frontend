import { useLocation } from "react-router-dom";
import { Bell, Menu } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface HeaderProps {
  onMenuClick?: () => void;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/claims": "Claims",
  "/users": "Users",
  "/settings": "Settings",
};

export default function Header({
  onMenuClick = () => {},
}: HeaderProps) {
  const location = useLocation();
  const { user } = useAuth();
  const title = pageTitles[location.pathname] ?? "Dashboard";
  const userInitial = user?.name.charAt(0).toUpperCase() ?? "U";

  return (
    <header className="h-16 bg-surface border-b border-border px-4 sm:px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open sidebar"
          className="p-2 -ml-2 text-text-muted hover:text-text hover:bg-background rounded-lg transition-colors lg:hidden"
        >
          <Menu size={21} />
        </button>

        <h1 className="text-lg font-semibold text-text truncate">
          {title}
        </h1>
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

        {/* Divider */}
        <div className="w-px h-7 bg-border" />

        {/* User information */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {userInitial}
          </div>

          <div className="hidden sm:flex flex-col">
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
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
