import {
  Users as UsersIcon,
  CheckCircle,
  Lock,
  Shield,
  FileText,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import StatCard from "../ui/StatCard";

export interface UserStatsData {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  claimsOfficers: number;
  fieldAdjusters: number;
}

interface UserStatsProps {
  stats: UserStatsData;
}

export default function UserStats({ stats }: UserStatsProps) {
  const activePercent = stats.total
    ? Math.round((stats.active / stats.total) * 100)
    : 0;

  const statCards: Array<{
    label: string;
    value: number;
    secondary: string;
    icon: LucideIcon;
    iconClass: string;
    dot?: string;
  }> = [
    {
      label: "Total Users",
      value: stats.total,
      secondary: "registered",
      icon: UsersIcon,
      iconClass: "text-primary",
    },
    {
      label: "Active Status",
      value: stats.active,
      secondary: `${activePercent}%`,
      icon: CheckCircle,
      iconClass: "text-emerald-500",
      dot: "bg-emerald-500",
    },
    {
      label: "Inactive / Suspended",
      value: stats.inactive,
      secondary: "locked",
      icon: Lock,
      iconClass: "text-gray-400",
    },
    {
      label: "Admins",
      value: stats.admins,
      secondary: "Full System",
      icon: Shield,
      iconClass: "text-admin",
    },
    {
      label: "Claims Officers",
      value: stats.claimsOfficers,
      secondary: "Triage Desk",
      icon: FileText,
      iconClass: "text-claims",
    },
    {
      label: "Field Adjusters",
      value: stats.fieldAdjusters,
      secondary: "On-Site",
      icon: MapPin,
      iconClass: "text-field",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statCards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}