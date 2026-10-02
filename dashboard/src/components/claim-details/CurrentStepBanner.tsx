import { AlertCircle, CheckCircle2, Clock, XCircle, AlertTriangle } from "lucide-react";
import type { ClaimStatus } from "../../types";
import { getStatusDescription } from "../../utils/claims";

interface CurrentStepBannerProps {
  status: ClaimStatus;
}

/**
 * CurrentStepBanner - Explains the current stage of the claim.
 * 
 * Shows a clear Arabic message telling the user:
 * - What is the current status?
 * - Why is the claim in this state?
 * - What is the next expected action?
 * 
 * No fake data, no invented states - purely based on the actual claim status.
 */
export default function CurrentStepBanner({ status }: CurrentStepBannerProps) {
  const { title, description, tone } = getStatusDescription(status);

  const config = {
    info: {
      bgClass: "bg-info-bg border-info-border",
      iconClass: "text-info-text",
      textClass: "text-info-strong",
      Icon: Clock,
    },
    warning: {
      bgClass: "bg-warning-bg border-warning-border",
      iconClass: "text-warning-text",
      textClass: "text-warning-strong",
      Icon: AlertCircle,
    },
    success: {
      bgClass: "bg-success-bg border-success-border",
      iconClass: "text-success-text",
      textClass: "text-success-strong",
      Icon: CheckCircle2,
    },
    danger: {
      bgClass: "bg-danger-bg border-danger-border",
      iconClass: "text-danger-text",
      textClass: "text-danger-strong",
      Icon: XCircle,
    },
    neutral: {
      bgClass: "bg-surface-soft border-border",
      iconClass: "text-text-muted",
      textClass: "text-text",
      Icon: AlertTriangle,
    },
  }[tone];

  const { bgClass, iconClass, textClass, Icon } = config;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${bgClass}`}
      role="status"
      aria-live="polite"
    >
      <Icon size={20} className={`${iconClass} mt-0.5 flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <h3 className={`text-sm font-semibold ${textClass} mb-1`}>
          الخطوة الحالية: {title}
        </h3>
        <p className="text-sm text-text-muted leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
