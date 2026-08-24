import { useParams, Link } from "react-router-dom";

export default function ClaimDetails() {
  const { claimId } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/claims" className="text-text-muted hover:text-text text-sm">
          ← Claims
        </Link>
        <span className="text-text-muted">/</span>
        <span className="text-sm font-medium text-text">{claimId}</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-text">Claim Details</h1>
        <p className="text-text-muted mt-1 text-sm">Claim Number: {claimId}</p>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
        <p className="text-text-muted text-sm">
          Claim details will appear here.
        </p>
      </div>
    </div>
  );
}
