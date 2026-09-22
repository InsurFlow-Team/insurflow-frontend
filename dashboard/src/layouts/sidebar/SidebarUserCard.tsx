import { LogOut } from "lucide-react";
import { userInitials } from "../../utils/user";

interface SidebarUserCardProps {
  userName: string;
  userRole: string;
  onLogout: () => void;
}

export default function SidebarUserCard({
  userName,
  userRole,
  onLogout,
}: SidebarUserCardProps) {
  return (
    <div className="px-3 py-3 border-t border-border">
      <div className="rounded-xl bg-primary px-3 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white font-semibold text-sm shrink-0">
          {userInitials(userName)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {userName}
          </p>
          <p className="text-xs text-white/60 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
            <span className="truncate">{userRole.replace(/_/g, " ")}</span>
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="mt-3 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-danger-bg hover:text-danger transition-colors duration-150 w-full"
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </div>
  );
}