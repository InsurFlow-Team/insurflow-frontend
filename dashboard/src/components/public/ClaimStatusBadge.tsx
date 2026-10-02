import { CheckCircle2, Clock, AlertCircle, XCircle, Loader2 } from "lucide-react";
import type { PublicClaimStatus } from "../../types/publicTracking";

interface ClaimStatusBadgeProps {
  status: PublicClaimStatus;
  description: string;
  size?: "sm" | "md" | "lg";
}

export default function ClaimStatusBadge({
  status,
  description,
  size = "md",
}: ClaimStatusBadgeProps) {
  const config = getStatusConfig(status);

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  const Icon = config.icon;

  return (
    <div className="space-y-2">
      <div
        className={`inline-flex items-center gap-2 rounded-full font-medium ${sizeClasses[size]} ${config.bgColor} ${config.textColor}`}
      >
        <Icon size={iconSizes[size]} />
        <span>{description}</span>
      </div>
    </div>
  );
}

function getStatusConfig(status: PublicClaimStatus) {
  switch (status) {
    case "PENDING":
      return {
        icon: Clock,
        bgColor: "bg-gray-100",
        textColor: "text-gray-700",
      };
    case "UNDER_REVIEW":
      return {
        icon: Loader2,
        bgColor: "bg-blue-100",
        textColor: "text-blue-700",
      };
    case "IN_PROGRESS":
      return {
        icon: Loader2,
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-700",
      };
    case "COMPLETED":
      return {
        icon: CheckCircle2,
        bgColor: "bg-green-100",
        textColor: "text-green-700",
      };
    case "REJECTED":
      return {
        icon: XCircle,
        bgColor: "bg-red-100",
        textColor: "text-red-700",
      };
    default:
      return {
        icon: AlertCircle,
        bgColor: "bg-gray-100",
        textColor: "text-gray-700",
      };
  }
}
