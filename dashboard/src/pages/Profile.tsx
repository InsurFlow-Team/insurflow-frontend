import { Navigate } from "react-router-dom";
import { ChevronRight, UserRound } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "../i18n/context";
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
  const { t } = useTranslation();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="space-y-6">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm text-text-muted"
      >
        <span>{t("profile.breadcrumb.operations")}</span>
        <ChevronRight size={14} className="text-text-muted rtl:rotate-180" />
        <span className="font-medium text-text">{t("profile.title")}</span>
      </nav>

      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text">
          {t("profile.title")}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          {t("profile.subtitle")}
        </p>
      </div>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary shrink-0">
            <UserRound size={20} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-text">
              {t("profile.section.account.title")}
            </h2>
            <p className="mt-0.5 text-sm text-text-muted">
              {t("profile.section.account.subtitle")}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label={t("profile.field.name")}>{user.name}</InfoItem>
          <InfoItem label={t("profile.field.employeeCode")}>{user.employeeCode}</InfoItem>
          <InfoItem label={t("profile.field.role")}>
            <RoleBadge role={user.role} />
          </InfoItem>
          <InfoItem label={t("profile.field.organization")}>{user.organizationName}</InfoItem>
          <InfoItem label={t("profile.field.status")}>
            {user.status ? <StatusBadge status={user.status} /> : "—"}
          </InfoItem>
        </div>
      </section>

      <ChangePasswordCard />
    </div>
  );
}
