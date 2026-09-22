import DetailSection from "./DetailSection";
import InfoRow from "./InfoRow";
import { formatDate } from "../../utils/claims";
import type { ClaimDetails as ClaimDetailsType } from "../../types";

interface CorrectionNotesSectionProps {
  claim: ClaimDetailsType;
}

function readString(value: Record<string, unknown>): string | null {
  const raw = value.note ?? value.message ?? value.reason;
  return typeof raw === "string" && raw.trim() !== "" ? raw : null;
}

export default function CorrectionNotesSection({
  claim,
}: CorrectionNotesSectionProps) {
  const correctionNotes = claim.correctionNotes ?? [];

  return (
    <DetailSection title="Correction Notes">
      {correctionNotes.length === 0 ? (
        <p className="text-sm text-text-muted">
          No correction notes available.
        </p>
      ) : (
        <div className="space-y-3">
          {correctionNotes.map((rawNote, index) => {
            const note = rawNote as Record<string, unknown>;

            return (
              <div
                key={`correction-${index}`}
                className="rounded-lg border border-border p-4"
              >
                <InfoRow
                  label="Note"
                  value={readString(note) ?? "Correction requested"}
                />
                {Boolean(note.createdAt || note.timestamp) && (
                  <InfoRow
                    label="Date"
                    value={formatDate(
                      typeof note.createdAt === "string"
                        ? note.createdAt
                        : typeof note.timestamp === "string"
                          ? note.timestamp
                          : "",
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </DetailSection>
  );
}