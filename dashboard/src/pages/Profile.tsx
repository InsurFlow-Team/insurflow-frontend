import { Navigate } from "react-router-dom";
import { ChevronRight, UserRound } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import ChangePasswordCard from "../components/settings/ChangePasswordCard";
import RoleBadge from "../components/ui/RoleBadge";
import StatusBadge from "../components/ui/StatusBadge";

function InfoItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <div className="mt-1 text-sm text-text">{children}</div>
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="space-y-6">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm text-text-muted"
      >
        <span>Operations</span>
        <ChevronRight size={14} className="text-text-muted" />
        <span className="font-medium text-text">Profile</span>
      </nav>

      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text">Profile</h1>
        <p className="mt-1 text-sm text-text-muted">
          Your account information and password. Own-profile data is read-only
          for consistency; role and organization changes are handled in User
          Management by an administrator.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary shrink-0">
            <UserRound size={20} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-text">
              Account information
            </h2>
            <p className="mt-0.5 text-sm text-text-muted">
              Details registered for your account in this organization.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="Name">{user.name}</InfoItem>
          <InfoItem label="Employee Code">{user.employeeCode}</InfoItem>
          <InfoItem label="Role">
            <RoleBadge role={user.role} />
          </InfoItem>
          <InfoItem label="Organization">{user.organizationName}</InfoItem>
          <InfoItem label="Status">
            {user.status ? <StatusBadge status={user.status} /> : "—"}
          </InfoItem>
        </div>
      </section>

      <ChangePasswordCard />
    </div>
  );
}