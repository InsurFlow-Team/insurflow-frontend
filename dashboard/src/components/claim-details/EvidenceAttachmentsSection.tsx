import { useState } from "react";
import Modal from "../ui/Modal";
import type { ClaimDetails as ClaimDetailsType } from "../../types";

interface EvidenceAttachmentsSectionProps {
  claim: ClaimDetailsType;
}

function readString(value: Record<string, unknown>, key: string): string | null {
  const raw = value[key];
  return typeof raw === "string" && raw.trim() !== "" ? raw : null;
}

interface PreviewState {
  url: string;
  name: string;
}

export default function EvidenceAttachmentsSection({
  claim,
}: EvidenceAttachmentsSectionProps) {
  const [preview, setPreview] = useState<PreviewState | null>(null);

  const items = [...(claim.evidence ?? []), ...(claim.attachments ?? [])];

  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-text">
        Evidence & Attachments
      </h2>

      {items.length === 0 ? (
        <p className="mt-5 text-sm text-text-muted">
          No evidence or attachments available.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {items.map((rawItem, index) => {
            const item = rawItem as Record<string, unknown>;
            const itemName =
              readString(item, "fileName") ??
              readString(item, "name") ??
              readString(item, "type") ??
              `Evidence ${index + 1}`;

            const itemUrl = readString(item, "url") ?? readString(item, "fileUrl");
            const isImage =
              itemUrl !== null &&
              /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(itemUrl);

            return (
              <div
                key={`${itemName}-${index}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <span className="text-sm font-medium text-text">{itemName}</span>

                {itemUrl &&
                  (isImage ? (
                    <button
                      type="button"
                      onClick={() => setPreview({ url: itemUrl, name: itemName })}
                      className="text-sm font-semibold text-primary hover:text-primary-dark"
                    >
                      Preview
                    </button>
                  ) : (
                    <a
                      href={itemUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-primary hover:text-primary-dark"
                    >
                      Open
                    </a>
                  ))}
              </div>
            );
          })}
        </div>
      )}

      {preview && (
        <Modal isOpen onClose={() => setPreview(null)} title={preview.name} size="md">
          <img
            src={preview.url}
            alt={preview.name}
            className="max-h-[70vh] w-full rounded-lg object-contain bg-slate-100"
          />
        </Modal>
      )}
    </section>
  );
}