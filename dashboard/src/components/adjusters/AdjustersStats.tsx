import {
  Users as UsersIcon,
  CheckCircle,
  Briefcase,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import StatCard from "../ui/StatCard";
import { useTranslation } from "../../i18n/context";

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
  const { t } = useTranslation();
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
      label: t("adjusters.stats.total"),
      value: stats.total,
      secondary: t("adjusters.stats.totalSecondary"),
      icon: UsersIcon,
      iconClass: "text-primary",
    },
    {
      label: t("adjusters.stats.available"),
      value: stats.available,
      secondary: t("adjusters.stats.availableSecondary", {
        percent: availablePercent,
      }),
      icon: CheckCircle,
      iconClass: "text-success-strong",
      dot: "bg-success-strong",
    },
    {
      label: t("adjusters.stats.unavailable"),
      value: stats.unavailableOrOffShift,
      secondary: t("adjusters.stats.unavailableSecondary"),
      icon: Briefcase,
      iconClass: "text-warning",
    },
    {
      label: t("adjusters.stats.pending"),
      value: stats.pendingClaims,
      secondary: t("adjusters.stats.pendingSecondary"),
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