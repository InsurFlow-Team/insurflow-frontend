import { NavLink } from "react-router-dom";
import type { NavigationItem } from "./navigation";

interface NavItemProps {
  item: NavigationItem;
  onNavigate: () => void;
  /** Renders indented settings children (icon gets a fixed slot width). */
  indent?: boolean;
}

export default function NavItem({
  item,
  onNavigate,
  indent = false,
}: NavItemProps) {
  return (
    <NavLink
      to={item.path}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
          isActive
            ? "bg-blue-50 text-primary"
            : "text-gray-500 hover:bg-gray-50 hover:text-primary"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-primary rounded-r-full" />
          )}
          {indent ? (
            <span className="w-[18px] shrink-0 flex justify-center">
              {item.icon}
            </span>
          ) : (
            item.icon
          )}
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  );
}