import apiClient from "./client";
import type { ApiResponse } from "./client";
import type {
  ClaimDetails,
  ClaimPriority,
  ClaimStatus,
  ClaimSummary,
  CreateClaimDraft,
} from "../types";

export interface CreateClaimRequest {
  customerName: string;
  customerPhone: string;
  initialPlateNumber: string;
  incidentType: string;
  incidentLocation: string;
}

export interface AssignClaimResult {
  id: string;
  claimNumber: string;
  status: ClaimStatus;
  priority: ClaimPriority;
  assignedTo: string;
  assignedBy: string;
  assignedAt: string;
}

const CLAIM_STATUSES: readonly ClaimStatus[] = [
  "NEW",
  "ASSIGNED",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "CLOSED",
];

export async function getClaims(status?: ClaimStatus) {
  const response = await apiClient.get<ApiResponse<ClaimSummary[]>>(
    "/claims",
    {
      params: status ? { status } : undefined,
    },
  );

  return response.data.data;
}

export async function getClaimById(claimId: string) {
  const response = await apiClient.get<ApiResponse<ClaimDetails>>(
    `/claims/${claimId}`,
  );

  return response.data.data;
}

export function toCreateClaimRequest(
  draft: CreateClaimDraft,
): CreateClaimRequest {
  return {
    customerName: draft.customerName,
    customerPhone: draft.customerPhone,
    initialPlateNumber: draft.initialPlateNumber,
    incidentType: draft.incidentType,
    incidentLocation: draft.incidentLocation,
  };
}

export async function createClaim(
  payload: CreateClaimRequest,
): Promise<ClaimSummary> {
  const response = await apiClient.post<ApiResponse<ClaimSummary>>(
    "/claims",
    payload,
  );

  return response.data.data;
}

export async function assignClaim(
  claimId: string,
  assignment: {
    adjusterId: string;
    priority: ClaimPriority;
    notes: string;
  },
): Promise<AssignClaimResult> {
  const response = await apiClient.post<ApiResponse<AssignClaimResult>>(
    `/claims/${claimId}/assign`,
    {
      adjusterId: assignment.adjusterId,
      priority: assignment.priority,
      notes: assignment.notes,
    },
  );

  return response.data.data;
}

export async function startClaimReview(claimId: string) {
  const response = await apiClient.post<
    ApiResponse<{ status: ClaimStatus }>
  >(`/claims/${claimId}/review/start`);

  return response.data.data;
}

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
  const status: ClaimStatus = (CLAIM_STATUSES as readonly string[]).includes(
    rawStatus,
  )
    ? (rawStatus as ClaimStatus)
    : "NEW";

  const rawCreatedAt =
    typeof source.createdAt === "string" &&
    !Number.isNaN(new Date(source.createdAt).getTime())
      ? source.createdAt
      : new Date().toISOString();

  const customer = source.customer as Record<string, unknown> | null;
  const vehicle = source.vehicle as Record<string, unknown> | null;

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
    createdAt: rawCreatedAt,
    updatedAt: typeof source.updatedAt === "string" ? source.updatedAt : undefined,
  };
}