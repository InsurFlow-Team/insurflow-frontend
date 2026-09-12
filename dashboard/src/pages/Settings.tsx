import { useNavigate } from "react-router-dom";
import { ChevronRight, Users } from "lucide-react";
import Button from "../components/ui/Button";
import ChangePasswordCard from "../components/settings/ChangePasswordCard";

export default function Settings() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm text-text-muted"
      >
        <span>Operations</span>
        <ChevronRight size={14} className="text-text-muted" />
        <span className="font-medium text-primary">Settings</span>
      </nav>

      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text">Settings</h1>
        <p className="mt-1 text-sm text-text-muted">
          Manage organization configuration and access.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary shrink-0">
              <Users size={20} />
            </span>
            <div>
              <h2 className="text-base font-semibold text-text">
                User Management
              </h2>
              <p className="mt-0.5 text-sm text-text-muted">
                Manage system users, assigned roles, and access credentials.
              </p>
            </div>
          </div>
          <Button icon={<ChevronRight size={16} />} onClick={() => navigate("/settings/users")}>
            Open
          </Button>
        </div>
      </section>

      <ChangePasswordCard />
    </div>
  );
}