import { FileImage, User, Calendar } from "lucide-react";
import DetailSection from "../DetailSection";
import { formatDateTime } from "../../../utils/claims";
import type { ClaimDetails } from "../../../types";

interface EvidenceSectionProps {
  claim: ClaimDetails;
}

/**
 * Evidence images captured by the Field Adjuster (mobile). Rendered straight
 * from the claim-details response — no extra API calls. Uploader may be null.
 * 
 * Enhanced to show:
 * - Total count and breakdown by type
 * - Upload timeline
 * - Clearer organization
 */
export default function EvidenceSection({ claim }: EvidenceSectionProps) {
  const { evidence } = claim;

  if (evidence.length === 0) {
    return (
      <DetailSection title="الأدلة والصور">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-surface-soft border border-border">
          <FileImage size={20} className="text-text-subtle" />
          <p className="text-sm text-text-muted">
            لم يتم رفع صور المعاينة بعد. سيقوم المعاين الميداني برفع الصور من تطبيق الجوال.
          </p>
        </div>
      </DetailSection>
    );
  }

  // Group evidence by type for summary
  const evidenceByType = evidence.reduce(
    (acc, item) => {
      const type = item.imageType || "غير محدد";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <DetailSection title="الأدلة والصور">
      <div className="space-y-4">
        {/* Evidence Summary */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-info-bg border border-info-border">
          <div className="flex items-center gap-2">
            <FileImage size={18} className="text-info-text" />
            <span className="text-sm font-medium text-info-strong">
              إجمالي الصور: {evidence.length}
            </span>
          </div>
          <div className="flex gap-3 text-xs text-info-strong">
            {Object.entries(evidenceByType).map(([type, count]) => (
              <span key={type}>
                {type}: {count}
              </span>
            ))}
          </div>
        </div>

        {/* Evidence Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {evidence.map((item, index) => (
            <div
              key={`${item.url}-${index}`}
              className="group overflow-hidden rounded-lg border border-border bg-surface hover:border-info transition-colors"
            >
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={item.url}
                    alt={item.imageType || "صورة دليل"}
                    className="h-40 w-full object-cover group-hover:opacity-90 transition-opacity"
                    loading="lazy"
                  />
                </a>
              ) : (
                <div className="flex h-40 w-full items-center justify-center bg-surface-soft">
                  <FileImage size={32} className="text-text-subtle" />
                </div>
              )}

              <div className="p-3 space-y-2">
                <p className="text-sm font-medium text-text truncate">
                  {item.imageType || "غير محدد"}
                </p>
                
                {item.uploadedBy && (
                  <div className="flex items-center gap-1.5 text-xs text-text-muted">
                    <User size={12} />
                    <span className="truncate">{item.uploadedBy.name}</span>
                  </div>
                )}
                
                {item.uploadedAt && (
                  <div className="flex items-center gap-1.5 text-xs text-text-subtle">
                    <Calendar size={12} />
                    <span>{formatDateTime(item.uploadedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-xs text-text-subtle pt-2 border-t border-border">
          جميع الصور تم رفعها من قبل المعاين الميداني أثناء المعاينة.
        </p>
      </div>
    </DetailSection>
  );
}