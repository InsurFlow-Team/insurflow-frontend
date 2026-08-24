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
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
            A
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-800 leading-tight">
              Ahmed
            </span>
            <span className="text-xs text-blue-500 font-medium leading-tight">
              ADMIN
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
