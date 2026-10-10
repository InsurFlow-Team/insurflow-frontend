import { ChevronRight } from "lucide-react";
import { useTranslation } from "../../i18n/context";

interface AdjustersHeaderProps {
  pollingPaused?: boolean;
  showLiveBadge?: boolean;
}

export default function AdjustersHeader({
  pollingPaused = false,
  showLiveBadge = true,
}: AdjustersHeaderProps) {
  const { t } = useTranslation();

  return (
    <div>
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm text-text-muted"
      >
        <span>{t("adjusters.breadcrumb.operations")}</span>
        <ChevronRight size={14} className="text-text-muted rtl:rotate-180" />
        <span className="font-medium text-primary">
          {t("adjusters.breadcrumb.title")}
        </span>
      </nav>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl lg:text-3xl font-bold text-text">
          {t("adjusters.title")}
        </h1>

        {showLiveBadge && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success-border bg-success-bg px-2.5 py-0.5 text-xs font-semibold text-success-strong">
            <span
              className={`h-2 w-2 rounded-full bg-success-strong ${pollingPaused ? "" : "animate-pulse"}`}
              aria-hidden="true"
            />
            {pollingPaused ? t("adjusters.liveSyncPaused") : t("adjusters.liveSynced")}
          </span>
        )}
      </div>

      <p className="mt-1 text-sm text-text-muted max-w-2xl">
        {t("adjusters.subtitle")}
      </p>
    </div>
  );
}
