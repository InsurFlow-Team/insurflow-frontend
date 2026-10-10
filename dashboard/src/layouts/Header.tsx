import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import UserMenu from "./header/UserMenu";
import NotificationBell from "../components/notifications/NotificationBell";
import LanguageSwitcher from "../components/ui/LanguageSwitcher";
import { useTranslation } from "../i18n/context";
import { pageTitle } from "./header/pageTitle";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick = () => {} }: HeaderProps) {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <header className="h-16 bg-surface border-b border-border px-4 sm:px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label={t("nav.openSidebar")}
          className="p-2 -ms-2 text-text-muted hover:text-text hover:bg-background rounded-lg transition-colors lg:hidden"
        >
          <Menu size={21} />
        </button>

        <h1 className="text-lg font-semibold text-text truncate">
          {t(pageTitle(location.pathname))}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <LanguageSwitcher />

        <NotificationBell />

        <div className="w-px h-7 bg-border" />

        <UserMenu />
      </div>

    </header>
  );
}