import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ClipboardCheck,
  FilePlus2,
  Send,
  ThumbsDown,
  ThumbsUp,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { Tone } from "../../utils/toneStyles";

/**
 * Icon and tone per notification type.
 *
 * Deliberately a lookup with a fallback rather than an exhaustive record: the
 * backend documents eight types but only emits four today (verified live
 * 2026-09-27), and a new type must render as a neutral row rather than break
 * the header. Every documented type routes to the claim it refers to.
 */
const TYPE_PRESENTATION: Record<string, { icon: LucideIcon; tone: Tone }> = {
  NEW_CLAIM: { icon: FilePlus2, tone: "info" },
  PENDING_ACCEPTANCE: { icon: ClipboardCheck, tone: "warning" },
  ASSIGNED: { icon: ClipboardCheck, tone: "violet" },
  IN_PROGRESS: { icon: Wrench, tone: "warning" },
  INSPECTION_COMPLETED: { icon: CheckCircle2, tone: "success" },
  SUBMITTED: { icon: Send, tone: "info" },
  CORRECTION_REQUIRED: { icon: AlertTriangle, tone: "rose" },
  ASSIGNMENT_DECLINED: { icon: ThumbsDown, tone: "danger" },
  APPROVED: { icon: ThumbsUp, tone: "success" },
  REJECTED: { icon: ThumbsDown, tone: "danger" },
};

const FALLBACK_PRESENTATION: { icon: LucideIcon; tone: Tone } = {
  icon: Bell,
  tone: "neutral",
};

export function notificationPresentation(type: string): {
  icon: LucideIcon;
  tone: Tone;
} {
  return TYPE_PRESENTATION[type] ?? FALLBACK_PRESENTATION;
}
