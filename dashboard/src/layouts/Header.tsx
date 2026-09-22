import { useLocation } from "react-router-dom";
import { Bell, Menu } from "lucide-react";
import UserMenu from "./header/UserMenu";
import { pageTitle } from "./header/pageTitle";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick = () => {} }: HeaderProps) {
  const location = useLocation();

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

        <h1 className="text-lg font-semibold text-text truncate">
          {pageTitle(location.pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification bell — inactive tonight: the backend has no
            notifications module yet (GET /notifications/unread-count →
            404). No fake dot. */}
        <button
          type="button"
          aria-label="Notifications"
          className="p-2 text-text-muted hover:text-text hover:bg-background rounded-lg transition-colors"
        >
          <Bell size={19} />
        </button>

        <div className="w-px h-7 bg-border" />

        <UserMenu />
      </div>
    </header>
  );
}