import { Link } from "react-router-dom";
import { ChevronRight, UserPlus } from "lucide-react";
import Button from "../ui/Button";

interface UsersPageHeaderProps {
  isAdmin: boolean;
  onAddUser: () => void;
}

export default function UsersPageHeader({
  isAdmin,
  onAddUser,
}: UsersPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-sm text-text-muted"
        >
          <span>Operations</span>
          <ChevronRight size={14} className="text-text-muted" />
          <Link to="/settings" className="hover:text-text transition-colors">
            Settings
          </Link>
          <ChevronRight size={14} className="text-text-muted" />
          <span className="font-medium text-primary">User Management</span>
        </nav>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl lg:text-3xl font-bold text-text">Users</h1>
          <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary-light px-2.5 py-0.5 text-xs font-semibold text-primary">
            System Registry
          </span>
        </div>

        <p className="mt-1 text-sm text-text-muted max-w-2xl">
          Manage system users, assigned roles, organization affiliations, and
          access credentials.
        </p>
      </div>

      {isAdmin ? (
        <Button
          icon={<UserPlus size={16} />}
          onClick={onAddUser}
          className="shrink-0"
        >
          Add User
        </Button>
      ) : (
        <span className="shrink-0 text-sm text-text-muted">
          Only administrators can add users.
        </span>
      )}
    </div>
  );
}