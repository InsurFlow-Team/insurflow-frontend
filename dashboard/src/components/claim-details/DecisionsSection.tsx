import DetailSection from "./DetailSection";
import InfoRow from "./InfoRow";
import { formatDate } from "../../utils/claims";
import type { ClaimDetails as ClaimDetailsType } from "../../types";

interface DecisionsSectionProps {
  claim: ClaimDetailsType;
}

function readString(value: Record<string, unknown>, key: string) {
  return typeof value[key] === "string" ? String(value[key]) : null;
}

export default function DecisionsSection({ claim }: DecisionsSectionProps) {
  const decisions = claim.decisions ?? [];

  return (
    <DetailSection title="Decisions">
      {decisions.length === 0 ? (
        <p className="text-sm text-text-muted">No decisions available.</p>
      ) : (
        <div className="space-y-3">
          {decisions.map((rawDecision, index) => {
            const decision = rawDecision as Record<string, unknown>;

            return (
              <div
                key={`decision-${index}`}
                className="rounded-lg border border-border p-4"
              >
                <InfoRow
                  label="Decision"
                  value={
                    readString(decision, "decision") ??
                    readString(decision, "action") ??
                    readString(decision, "status") ??
                    "Decision"
                  }
                />
                <InfoRow
                  label="Notes"
                  value={
                    readString(decision, "notes") ??
                    readString(decision, "reason") ??
                    "No additional notes."
                  }
                />
                {Boolean(decision.createdAt || decision.timestamp) && (
                  <InfoRow
                    label="Date"
                    value={formatDate(
                      readString(decision, "createdAt") ??
                        readString(decision, "timestamp"),
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