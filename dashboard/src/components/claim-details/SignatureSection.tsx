import DetailSection from "./DetailSection";
import InfoGrid from "./InfoGrid";
import InfoRow from "./InfoRow";
import { formatDate } from "../../utils/claims";
import type { ClaimDetails as ClaimDetailsType } from "../../types";

interface SignatureSectionProps {
  claim: ClaimDetailsType;
}

function readString(value: Record<string, unknown> | null, key: string) {
  return typeof value?.[key] === "string" && value[key]!.trim() !== ""
    ? String(value[key])
    : null;
}

export default function SignatureSection({ claim }: SignatureSectionProps) {
  const signature = claim.signature ?? null;

  return (
    <DetailSection title="Customer Signature">
      <InfoGrid columns="3">
        <InfoRow
          label="Signature Status"
          value={signature ? "Signed" : "Not available"}
        />
        <InfoRow
          label="Signed By"
          value={
            signature
              ? readString(signature, "signerName") ??
                readString(signature, "signedBy") ??
                "Customer"
              : null
          }
        />
        <InfoRow
          label="Signed At"
          value={
            signature
              ? formatDate(
                  readString(signature, "signedAt") ??
                    readString(signature, "timestamp"),
                )
              : null
          }
        />
      </InfoGrid>
    </DetailSection>
  );
}