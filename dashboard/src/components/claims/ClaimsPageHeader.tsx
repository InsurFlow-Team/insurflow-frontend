import { Link } from "react-router-dom";
import { ChevronRight, Plus } from "lucide-react";
import Button from "../ui/Button";
import { useTranslation } from "../../i18n/context";

interface ClaimsPageHeaderProps {
  organizationName?: string;
  onAddClaim: () => void;
}

export default function ClaimsPageHeader({
  organizationName,
  onAddClaim,
}: ClaimsPageHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <nav
          aria-label={t("claims.header.breadcrumb")}
          className="flex items-center gap-1.5 text-sm text-text-muted"
        >
          <Link
            to="/dashboard"
            className="text-primary hover:text-primary-dark transition-colors"
          >
            {t("claims.header.operations")}
          </Link>
          <ChevronRight size={14} className="text-text-muted rtl:rotate-180" />
          <span className="font-medium text-primary">
            {t("claims.header.queue")}
          </span>
        </nav>

        <h1 className="mt-2 text-2xl lg:text-3xl font-bold text-text">
          {t("claims.header.title")}
        </h1>

        <p className="mt-1 text-sm text-text-muted max-w-2xl">
          {t("claims.header.subtitle")}
        </p>

        {organizationName && (
          <p className="mt-2 text-xs text-text-muted">
            <span className="font-medium text-text">
              {t("claims.header.organization")}:
            </span>{" "}
            {organizationName}
          </p>
        )}
      </div>

      <Button
        variant="primary"
        icon={<Plus size={15} />}
        onClick={onAddClaim}
      >
        {t("claims.addClaim")}
      </Button>
    </div>
  );
}
