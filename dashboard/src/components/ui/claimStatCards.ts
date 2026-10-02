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
  ThumbsDown,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { ClaimStatus } from "../../types";
import { statusStyles } from "../../utils/statusStyles";
import { toneClass } from "../../utils/toneStyles";

// The single source of truth for the claim stat cards, shared by the Claims page
// and the Dashboard. Every ClaimStatus must have an entry here, otherwise the
// cards stop adding up to the total. The order is the claim lifecycle, so the
// grid reads left-to-right as the claim moves.
export interface ClaimStatCardConfig {
  key: ClaimStatus;
  label: string;
  secondary: string;
  icon: LucideIcon;
  iconClass: string;
}

const CLAIM_CARD_CONTENT = [
  {
    key: "NEW",
    label: "New",
    secondary: "Awaiting assignment",
    icon: FilePlus2,
  },
  {
    key: "PENDING_ACCEPTANCE",
    label: "Awaiting Reply",
    secondary: "Pending adjuster acceptance",
    icon: Clock,
  },
  {
    key: "ASSIGNED",
    label: "Assigned",
    secondary: "With a field adjuster",
    icon: ClipboardCheck,
  },
  {
    key: "IN_PROGRESS",
    label: "In Progress",
    secondary: "Inspections underway",
    icon: Wrench,
  },
  {
    key: "CORRECTION_REQUIRED",
    label: "Correction Required",
    secondary: "Awaiting updated inspection",
    icon: AlertTriangle,
  },
  {
    key: "SUBMITTED",
    label: "Submitted",
    secondary: "Ready for initial review",
    icon: Send,
  },
  {
    key: "UNDER_REVIEW",
    label: "Under Review",
    secondary: "Awaiting the admin decision",
    icon: ScanSearch,
  },
  {
    key: "APPROVED",
    label: "Approved",
    secondary: "Approved for settlement",
    icon: CheckCircle2,
  },
  {
    key: "REJECTED",
    label: "Rejected",
    secondary: "Declined after review",
    icon: ThumbsDown,
  },
  {
    key: "CLOSED",
    label: "Closed",
    secondary: "Lifecycle completed",
    icon: Archive,
  },
] satisfies Omit<ClaimStatCardConfig, "iconClass">[];

// The icon colour is never written by hand: it is derived from the status tone
// in `statusStyles`, so a card and its badge can never drift apart.
export const CLAIM_STATUS_CARDS: ClaimStatCardConfig[] = CLAIM_CARD_CONTENT.map(
  (card) => ({
    ...card,
    iconClass: toneClass(statusStyles[card.key].tone, "icon"),
  }),
);

export const TOTAL_CLAIM_CARD = {
  key: "total",
  label: "Total Claims",
  secondary: "Every claim in your organization, in any status",
  icon: FileText,
  iconClass: "text-primary",
} as const;
