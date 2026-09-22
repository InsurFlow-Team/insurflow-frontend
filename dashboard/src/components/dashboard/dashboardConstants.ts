import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FilePlus2,
  FileText,
  ScanSearch,
  Send,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { ClaimStatus } from "../../types";

export const RECENT_CLAIMS_COUNT = 5;

export interface ClaimStatCardConfig {
  key: ClaimStatus;
  label: string;
  secondary: string;
  icon: LucideIcon;
  iconClass: string;
}

export const STATUS_CARDS: ClaimStatCardConfig[] = [
  {
    key: "NEW",
    label: "New Claims",
    secondary: "Awaiting assignment",
    icon: FilePlus2,
    iconClass: "text-gray-500",
  },
  {
    key: "PENDING_ACCEPTANCE",
    label: "Awaiting Reply",
    secondary: "Pending adjuster acceptance",
    icon: Clock,
    iconClass: "text-blue-600",
  },
  {
    key: "IN_PROGRESS",
    label: "In Progress Claims",
    secondary: "Inspections underway",
    icon: Wrench,
    iconClass: "text-accent",
  },
  {
    key: "ASSIGNED",
    label: "Assigned Claims",
    secondary: "With a field adjuster",
    icon: ClipboardCheck,
    iconClass: "text-purple-600",
  },
  {
    key: "SUBMITTED",
    label: "Submitted Claims",
    secondary: "Ready for initial review",
    icon: Send,
    iconClass: "text-info",
  },
  {
    key: "CORRECTION_REQUIRED",
    label: "Correction Required",
    secondary: "Awaiting updated inspection",
    icon: AlertTriangle,
    iconClass: "text-amber-600",
  },
  {
    key: "UNDER_REVIEW",
    label: "Under Review Claims",
    secondary: "Requires inspection or sign-off",
    icon: ScanSearch,
    iconClass: "text-accent",
  },
  {
    key: "APPROVED",
    label: "Approved Claims",
    secondary: "Approved for settlement",
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
  },
  {
    key: "CLOSED",
    label: "Closed Claims",
    secondary: "Lifecycle completed",
    icon: Archive,
    iconClass: "text-gray-500",
  },
] as const satisfies ClaimStatCardConfig[];

export function TotalClaimCardConfig() {
  return {
    key: "total",
    label: "Total Claims",
    secondary: "Claims in your organization",
    icon: FileText,
    iconClass: "text-primary",
  } as const;
}