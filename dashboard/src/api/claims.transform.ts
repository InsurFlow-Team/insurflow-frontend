import type { ClaimSummary } from "../types";
import { normalizeGeoPoint } from "../utils/geo";

const CLAIM_STATUSES: readonly string[] = [
  "NEW",
  "PENDING_ACCEPTANCE",
  "ASSIGNED",
  "IN_PROGRESS",
  "SUBMITTED",
  "UNDER_REVIEW",
  "CORRECTION_REQUIRED",
  "APPROVED",
  "CLOSED",
];

export function toClaimSummary(record: unknown): ClaimSummary {
  if (!record || typeof record !== "object") {
    return {
      id: "",
      claimNumber: "",
      status: "NEW",
      customerName: "",
      initialPlateNumber: "",
      createdAt: new Date().toISOString(),
    };
  }

  const source = record as Record<string, unknown>;

  const rawStatus = typeof source.status === "string" ? source.status : "";
  const status = (CLAIM_STATUSES.includes(rawStatus) ? rawStatus : "NEW") as ClaimSummary["status"];

  const rawCreatedAt =
    typeof source.createdAt === "string" &&
    !Number.isNaN(new Date(source.createdAt).getTime())
      ? source.createdAt
      : new Date().toISOString();

  const customer = source.customer as Record<string, unknown> | null;
  const vehicle = source.vehicle as Record<string, unknown> | null;

  const rawDecline = source.lastDecline as Record<string, unknown> | null;
  const lastDecline = rawDecline
    ? {
        reason:
          typeof rawDecline.reason === "string" ? rawDecline.reason : undefined,
        adjusterName:
          typeof rawDecline.adjusterName === "string"
            ? rawDecline.adjusterName
            : typeof rawDecline.declinedBy === "string"
              ? rawDecline.declinedBy
              : undefined,
        declinedAt:
          typeof rawDecline.declinedAt === "string"
            ? rawDecline.declinedAt
            : undefined,
      }
    : typeof source.declineReason === "string"
      ? {
          reason: source.declineReason as string,
          adjusterName:
            typeof source.declinedBy === "string"
              ? (source.declinedBy as string)
              : undefined,
        }
      : null;

  return {
    id:
      typeof source.id === "string"
        ? source.id
        : typeof source._id === "string"
          ? source._id
          : "",
    claimNumber:
      typeof source.claimNumber === "string" ? source.claimNumber : "",
    status,
    customerName:
      typeof source.customerName === "string"
        ? source.customerName
        : typeof customer?.name === "string"
          ? customer.name
          : "",
    initialPlateNumber:
      typeof source.initialPlateNumber === "string"
        ? source.initialPlateNumber
        : typeof vehicle?.plateNumber === "string"
          ? vehicle.plateNumber
          : "",
    incidentCoordinates: normalizeGeoPoint(source.incidentCoordinates),
    ...(lastDecline ? { lastDecline } : {}),
    createdAt: rawCreatedAt,
    updatedAt:
      typeof source.updatedAt === "string" ? source.updatedAt : undefined,
  };
}