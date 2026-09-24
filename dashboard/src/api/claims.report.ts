import apiClient, { getApiErrorMessage } from "./client";
import { downloadBlob } from "../utils/download";
import type { ClaimDetails } from "../types";

const FINAL_DECISION_STATUSES = ["APPROVED", "REJECTED", "CLOSED"] as const;

export type FinalDecisionClaimStatus = (typeof FINAL_DECISION_STATUSES)[number];

export function canExportClaimReport(
  status: string,
): status is FinalDecisionClaimStatus {
  return (FINAL_DECISION_STATUSES as readonly string[]).includes(status);
}

export interface ClaimExportStatus {
  exportable: boolean;
  disabledReason: string | null;
}

export function getClaimExportStatus(claim: ClaimDetails): ClaimExportStatus {
  const accident = claim.accident;
  const hasAccident =
    accident !== null &&
    Boolean(
      accident.accidentType ||
        accident.accidentDate ||
        accident.accidentTime ||
        accident.description ||
        accident.damageDescription,
    );

  const missing: string[] = [];
  if (!hasAccident) missing.push("تفاصيل الحادث");
  if (claim.evidence.length === 0) missing.push("صور المعاينة");
  if (!claim.signature) missing.push("التوقيع");

  const hasInspectionLocation =
    claim.location !== null &&
    claim.location.latitude !== null &&
    claim.location.longitude !== null;
  if (!hasInspectionLocation) missing.push("موقع المعاينة الميدانية");

  if (missing.length > 0) {
    return {
      exportable: false,
      disabledReason: `أكمل أولاً: ${missing.join("، ")}`,
    };
  }

  if (!canExportClaimReport(claim.status)) {
    return {
      exportable: false,
      disabledReason:
        "التقرير متاح بعد القرار النهائي (APPROVED / REJECTED / CLOSED)",
    };
  }

  return { exportable: true, disabledReason: null };
}

function isResponseError(
  error: unknown,
): error is { response?: { data?: unknown } } {
  return typeof error === "object" && error !== null && "response" in error;
}

async function blobErrorMessage(error: unknown): Promise<string | null> {
  const data = isResponseError(error) ? error.response?.data : undefined;

  if (!(data instanceof Blob)) return null;

  try {
    const parsed = JSON.parse(await data.text()) as { message?: string };
    return parsed.message ?? null;
  } catch {
    return null;
  }
}

export async function downloadClaimReport(claimId: string, claimNumber: string) {
  let response;

  try {
    response = await apiClient.get(`/claims/${claimId}/report`, {
      responseType: "blob",
    });
  } catch (error) {
    const blobMessage = await blobErrorMessage(error);
    throw new Error(blobMessage ?? getApiErrorMessage(error));
  }

  const contentType = String(response.headers?.["content-type"] ?? "").toLowerCase();

  if (!contentType.includes("application/pdf")) {
    const blobMessage = await blobErrorMessage({ response: { data: response.data } });
    throw new Error(blobMessage ?? "Unexpected response — expected a PDF file.");
  }

  downloadBlob(response.data as Blob, `${claimNumber}_report.pdf`);
}