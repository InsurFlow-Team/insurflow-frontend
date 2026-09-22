import { Link } from "react-router-dom";
import { ChevronRight, Plus } from "lucide-react";
import Button from "../ui/Button";

interface ClaimsPageHeaderProps {
  organizationName?: string;
  onAddClaim: () => void;
}

export default function ClaimsPageHeader({
  organizationName,
  onAddClaim,
}: ClaimsPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-sm text-text-muted"
        >
          <Link
            to="/dashboard"
            className="text-primary hover:text-primary-dark transition-colors"
          >
            Operations
          </Link>
          <ChevronRight size={14} className="text-text-muted" />
          <span className="font-medium text-primary">Claims Queue</span>
        </nav>

        <h1 className="mt-2 text-2xl lg:text-3xl font-bold text-text">
          Claims Triage & Directory
        </h1>

        <p className="mt-1 text-sm text-text-muted max-w-2xl">
          Review submitted claims, monitor assessment lifecycle, and assign
          field adjusters.
        </p>

        {organizationName && (
          <p className="mt-2 text-xs text-text-muted">
            <span className="font-medium text-text">Organization:</span>{" "}
            {organizationName}
          </p>
        )}
      </div>

      <Button
        variant="primary"
        icon={<Plus size={15} />}
        onClick={onAddClaim}
      >
        Add Claim
      </Button>
    </div>
  );
}