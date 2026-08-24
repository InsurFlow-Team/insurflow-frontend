import { Link } from "react-router-dom";

export default function ClaimsList() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Claims</h1>
        <p className="text-text-muted mt-1 text-sm">
          Review and manage submitted claims.
        </p>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
        <Link
          to="/claims/CLM-0001"
          className="text-primary hover:text-primary-dark font-medium underline"
        >
          فتح المطالبة CLM-0001
        </Link>
      </div>
    </div>
  );
}
