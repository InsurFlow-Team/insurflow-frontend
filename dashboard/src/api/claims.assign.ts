import apiClient from "./client";
import type { ApiResponse } from "./client";
import type { ClaimPriority, ClaimStatus } from "../types";

export interface AssignClaimResult {
  id: string;
  claimNumber: string;
  status: ClaimStatus;
  priority: ClaimPriority;
  assignedTo: string;
  assignedBy: string;
  assignedAt: string;
}

export async function assignClaim(
  claimId: string,
  assignment: {
    adjusterId: string;
    priority: ClaimPriority;
    notes: string;
    overrideCapacity?: boolean;
  },
): Promise<AssignClaimResult> {
  const response = await apiClient.post<ApiResponse<AssignClaimResult>>(
    `/claims/${claimId}/assign`,
    {
      adjusterId: assignment.adjusterId,
      priority: assignment.priority,
      notes: assignment.notes,
      ...(assignment.overrideCapacity
        ? { overrideCapacity: assignment.overrideCapacity }
        : {}),
    },
  );

  return response.data.data;
}