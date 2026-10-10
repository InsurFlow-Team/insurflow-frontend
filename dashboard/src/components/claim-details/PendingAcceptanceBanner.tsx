import { Clock } from "lucide-react";
import { useTranslation } from "../../i18n/context";

export default function PendingAcceptanceBanner() {
  const { t } = useTranslation();
  return (
    <div className="flex items-start gap-3 rounded-xl border border-info-border bg-info-bg p-4 text-sm text-info-deep">
      <Clock size={18} className="mt-0.5 shrink-0" />
      <div>
        <p className="font-semibold">{t("claim.awaitingAdjusterReply")}</p>
        <p className="mt-0.5 text-info-text">
          {t("claim.adjusterAcceptanceExplanation")}
        </p>
      </div>
    </div>
  );
}