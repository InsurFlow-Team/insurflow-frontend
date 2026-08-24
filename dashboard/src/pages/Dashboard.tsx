import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";

const claimStatistics = [
  {
    label: "Total Claims",
    value: 0,
    icon: <FileText size={20} />,
    color: "border-primary bg-primary-light text-primary-dark",
    iconColor: "text-primary",
  },
  {
    label: "Draft Claims",
    value: 0,
    icon: <Clock size={20} />,
    color: "border-border bg-surface-soft text-text",
    iconColor: "text-text-muted",
  },
  {
    label: "Submitted",
    value: 0,
    icon: <CheckCircle size={20} />,
    color: "border-info bg-blue-50 text-info",
    iconColor: "text-info",
  },
  {
    label: "Pending Review",
    value: 0,
    icon: <AlertCircle size={20} />,
    color: "border-warning bg-accent-light text-accent",
    iconColor: "text-accent",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Dashboard</h1>
          <p className="text-text-muted mt-1 text-sm">
            Overview of the current insurance claims.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-light text-primary-dark border border-primary/30">
          Sprint 1
        </span>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {claimStatistics.map((stat) => (
          <article
            key={stat.label}
            className={`rounded-xl border border-l-4 p-5 shadow-sm bg-surface ${stat.color}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">{stat.label}</span>
              <span className={stat.iconColor}>{stat.icon}</span>
            </div>
            <strong className="block text-3xl font-bold">{stat.value}</strong>
          </article>
        ))}
      </div>

      {/* Recent Activity placeholder */}
      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
        <h2 className="text-base font-semibold text-text mb-4">
          Recent Claims
        </h2>
        <div className="flex flex-col items-center justify-center py-10 text-text-muted">
          <FileText size={36} className="mb-3 opacity-30" />
          <p className="text-sm">No claims yet.</p>
        </div>
      </div>
    </div>
  );
}
