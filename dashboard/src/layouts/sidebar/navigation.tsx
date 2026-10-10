import {
  FileText,
  LayoutDashboard,
  Map,
  MapPin,
  Settings,
  UserRound,
  Users,
} from "lucide-react";
import type { MessageKey } from "../../i18n/messages.en";
import type { Role } from "../../types";

export interface NavigationItem {
  labelKey: MessageKey;
  path: string;
  icon: React.ReactNode;
  roles: Role[];
  end?: boolean;
}

export const navigationItems: NavigationItem[] = [
  {
    labelKey: "nav.overview",
    path: "/dashboard",
    icon: <LayoutDashboard size={18} />,
    roles: ["ADMIN", "CLAIMS_OFFICER"],
  },
  {
    labelKey: "claims.header.queue",
    path: "/claims",
    icon: <FileText size={18} />,
    roles: ["ADMIN", "CLAIMS_OFFICER"],
  },
  {
    labelKey: "nav.fieldAdjusters",
    path: "/adjusters",
    icon: <MapPin size={18} />,
    roles: ["ADMIN", "CLAIMS_OFFICER"],
  },
  {
    labelKey: "map.title",
    path: "/map",
    icon: <Map size={18} />,
    roles: ["ADMIN", "CLAIMS_OFFICER"],
  },
  {
    labelKey: "nav.profile",
    path: "/profile",
    icon: <UserRound size={18} />,
    roles: ["ADMIN", "CLAIMS_OFFICER"],
  },
];

export const settingsParent: NavigationItem = {
  labelKey: "nav.settings",
  path: "/settings",
  icon: <Settings size={18} />,
  roles: ["ADMIN"],
  end: true,
};

export const settingsChildren: NavigationItem[] = [
  {
    labelKey: "nav.userManagement",
    path: "/settings/users",
    icon: <Users size={18} />,
    roles: ["ADMIN"],
  },
];
