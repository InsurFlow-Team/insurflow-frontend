import {
  AlertCircle,
  Clock,
  FolderOpen,
  Inbox,
  PenLine,
  Wrench,
} from "lucide-react";
import StatCard from "../ui/StatCard";

export interface ClaimsStats {
  totalClaims: number;
  newClaims: number;
  awaitingReply: number;
  submittedClaims: number;
  pendingReview: number;
  inProgress: number;
}

interface ClaimsStatsProps {
  stats: ClaimsStats;
}

export default function ClaimsStats({ stats }: ClaimsStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        label="Total Claims"
        value={stats.totalClaims}
        secondary="Active portfolio records"
        icon={FolderOpen}
        iconClass="text-primary"
      />
      <StatCard
        label="New"
        value={stats.newClaims}
        secondary="Awaiting customer submission"
        icon={PenLine}
        iconClass="text-gray-500"
      />
      <StatCard
        label="Awaiting Reply"
        value={stats.awaitingReply}
        secondary="Pending adjuster acceptance"
        icon={Clock}
        iconClass="text-info"
      />
      <StatCard
        label="In Progress"
        value={stats.inProgress}
        secondary="Inspections underway"
        icon={Wrench}
        iconClass="text-accent"
      />
      <StatCard
        label="Submitted"
        value={stats.submittedClaims}
        secondary="Ready for initial review"
        icon={Inbox}
        iconClass="text-info"
      />
      <StatCard
        label="Pending Review"
        value={stats.pendingReview}
        secondary="Requires inspection or sign-off"
        icon={AlertCircle}
        iconClass="text-accent"
      />
    </div>
  );
}