import { useLocation } from "react-router-dom";
import { Bell } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/claims": "Claims",
  "/users": "Users",
  "/settings": "Settings",
};

export default function Header() {
  const location = useLocation();
  const title = pageTitles[location.pathname] ?? "Dashboard";

  return (
    <header className="h-16 bg-surface border-b border-border px-6 flex items-center justify-between shrink-0">
      <h1 className="text-lg font-semibold text-text">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative p-2 text-text-muted hover:text-text hover:bg-background rounded-lg transition-colors">
          <Bell size={19} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-border" />

        {/* User info */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm shrink-0">
            A
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-text leading-tight">
              Ahmed
            </span>
            <span className="text-xs text-accent font-medium leading-tight">
              ADMIN
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
