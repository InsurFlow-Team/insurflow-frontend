import { FolderOpen, PenLine, Inbox, AlertCircle } from "lucide-react";
import StatCard from "../ui/StatCard";

export interface ClaimsStatsData {
  totalClaims: number;
  draftClaims: number;
  submittedClaims: number;
  pendingReview: number;
}

export default function ClaimsStats({ stats }: { stats: ClaimsStatsData }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Claims"
        value={stats.totalClaims}
        secondary="Active portfolio records"
        icon={FolderOpen}
        iconClass="text-primary"
      />
      <StatCard
        label="Draft Claims"
        value={stats.draftClaims}
        secondary="Awaiting customer submission"
        icon={PenLine}
        iconClass="text-gray-500"
      />
      <StatCard
        label="Submitted Claims"
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