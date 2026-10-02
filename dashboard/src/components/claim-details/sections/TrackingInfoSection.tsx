import { Link2, Copy, CheckCircle2, Lightbulb } from "lucide-react";
import { useState } from "react";
import DetailSection from "../DetailSection";
import Button from "../../ui/Button";
import type { ClaimDetails } from "../../../types";

interface TrackingInfoSectionProps {
  claim: ClaimDetails;
}

/**
 * TrackingInfoSection - Shows customer tracking information.
 * 
 * Displays the tracking token and URL that can be shared with the customer
 * for self-service claim status tracking. Only shown if tracking data exists.
 */
export default function TrackingInfoSection({
  claim,
}: TrackingInfoSectionProps) {
  const { trackingToken, trackingUrl } = claim;
  const [copied, setCopied] = useState(false);

  // Don't render if no tracking info available
  if (!trackingToken && !trackingUrl) {
    return null;
  }

  const handleCopyLink = async () => {
    if (!trackingUrl) return;

    try {
      await navigator.clipboard.writeText(trackingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      console.error("Failed to copy:", err);
    }
  };

  return (
    <DetailSection title="رابط تتبع المطالبة">
      <div className="space-y-4">
        {/* Info banner */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-info-bg border border-info-border">
          <Link2 size={18} className="text-info-text mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-info-strong mb-1">
              رابط التتبع للعميل
            </p>
            <p className="text-info-text text-xs">
              يمكن مشاركة هذا الرابط مع العميل لمتابعة حالة المطالبة بدون
              الحاجة لتسجيل الدخول.
            </p>
          </div>
        </div>

        {/* Tracking Token */}
        {trackingToken && (
          <div className="p-3 rounded-lg border border-border bg-surface-soft">
            <p className="text-xs font-medium text-text-muted mb-2">
              رمز التتبع:
            </p>
            <code className="text-sm font-mono text-text select-all">
              {trackingToken}
            </code>
          </div>
        )}

        {/* Tracking URL */}
        {trackingUrl && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-text-muted">
              رابط التتبع:
            </p>
            <div className="flex gap-2">
              <div className="flex-1 p-3 rounded-lg border border-border bg-surface-soft overflow-hidden">
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-info hover:underline truncate block"
                >
                  {trackingUrl}
                </a>
              </div>
              <Button
                variant="secondary"
                onClick={handleCopyLink}
                icon={copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                title="نسخ الرابط"
              >
                {copied ? "تم النسخ" : "نسخ"}
              </Button>
            </div>
          </div>
        )}

        {/* Usage note */}
        <div className="flex items-start gap-2 pt-2 border-t border-border">
          <Lightbulb size={14} className="mt-0.5 shrink-0 text-warning" />
          <p className="text-xs text-text-subtle">
            يمكن إرسال هذا الرابط للعميل عبر الرسائل القصيرة أو البريد
            الإلكتروني لمتابعة حالة المطالبة.
          </p>
        </div>
      </div>
    </DetailSection>
  );
}
