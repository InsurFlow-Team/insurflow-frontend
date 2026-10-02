import {
  FileText,
  LayoutDashboard,
  Map,
  MapPin,
  Settings,
  UserRound,
  Users,
} from "lucide-react";
import type { Role } from "../../types";

export interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: Role[];
  end?: boolean;
}

export const navigationItems: NavigationItem[] = [
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
  {
    label: "Field Adjusters",
    path: "/adjusters",
    icon: <MapPin size={18} />,
    roles: ["ADMIN", "CLAIMS_OFFICER"],
  },
  {
    label: "Map Dispatch",
    path: "/map",
    icon: <Map size={18} />,
    roles: ["ADMIN", "CLAIMS_OFFICER"],
  },
  {
    label: "Profile",
    path: "/profile",
    icon: <UserRound size={18} />,
    roles: ["ADMIN", "CLAIMS_OFFICER"],
  },
];

export const settingsParent: NavigationItem = {
  label: "Settings",
  path: "/settings",
  icon: <Settings size={18} />,
  roles: ["ADMIN"],
  end: true,
};

export const settingsChildren: NavigationItem[] = [
  {
    label: "User Management",
    path: "/settings/users",
    icon: <Users size={18} />,
    roles: ["ADMIN"],
  },
];