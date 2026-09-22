import {
  Users as UsersIcon,
  CheckCircle,
  Briefcase,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import StatCard from "../ui/StatCard";

export interface AdjustersStatsData {
  total: number;
  available: number;
  unavailableOrOffShift: number;
  pendingClaims: number;
}

interface AdjustersStatsProps {
  stats: AdjustersStatsData;
}

export default function AdjustersStats({ stats }: AdjustersStatsProps) {
  const availablePercent = stats.total
    ? Math.round((stats.available / stats.total) * 100)
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
      label: "Total Adjusters",
      value: stats.total,
      secondary: "Field operations roster",
      icon: UsersIcon,
      iconClass: "text-primary",
    },
    {
      label: "Available Now",
      value: stats.available,
      secondary: `${availablePercent}% of fleet · Ready for dispatch`,
      icon: CheckCircle,
      iconClass: "text-emerald-500",
      dot: "bg-emerald-500",
    },
    {
      label: "Unavailable / Off-Shift",
      value: stats.unavailableOrOffShift,
      secondary: "Busy or inactive",
      icon: Briefcase,
      iconClass: "text-amber-600",
    },
    {
      label: "Claims Awaiting Assignment",
      value: stats.pendingClaims,
      secondary: "Not yet assigned to an adjuster",
      icon: ClipboardList,
      iconClass: "text-field",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}