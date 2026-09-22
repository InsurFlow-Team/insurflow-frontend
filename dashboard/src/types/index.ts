export type Role = "ADMIN" | "CLAIMS_OFFICER" | "FIELD_ADJUSTER";

export type UserStatus = "ACTIVE" | "INACTIVE";

export type ClaimStatus =
  | "NEW"
  | "PENDING_ACCEPTANCE"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "CORRECTION_REQUIRED"
  | "APPROVED"
  | "REJECTED"
  | "CLOSED";

export type ClaimPriority = "LOW" | "MEDIUM" | "HIGH";

export type InspectionTaskStatus = "ASSIGNED" | "IN_PROGRESS" | "SUBMITTED";

export type Availability = "AVAILABLE" | "UNAVAILABLE";

export interface GeoPoint {
  latitude?: number | null;
  longitude?: number | null;
  capturedAt?: string | null;
}


export type CreateUserRequest = {
  name: string;
  employeeCode: string;
  password: string;
  role: "CLAIMS_OFFICER" | "FIELD_ADJUSTER";
};

export interface User {
  id: string;
  name: string;
  employeeCode: string;
  role: Role;
  organizationId: string;
  organizationName: string;
  status?: UserStatus;
}

export interface FieldAdjuster extends User {
  status: UserStatus;
  activeTasksCount: number;
  availability: Availability;
  capacityLimit?: number | null;
  location?: GeoPoint | null;
  distanceKm?: number | null;
}

export interface LastDeclineInfo {
  reason?: string;
  adjusterName?: string;
  declinedAt?: string;
}

export interface ClaimSummary {
  id: string;
  claimNumber: string;
  status: ClaimStatus;
  customerName: string;
  initialPlateNumber: string;
  createdAt: string;
  updatedAt?: string;
  incidentCoordinates?: GeoPoint | null;
  lastDecline?: LastDeclineInfo | null;
}


export interface CreateClaimDraft {
  policyId: string; // Required: comes from policy verification
  plateNumber: string; // Required: verified plate number
  incidentType: string;
  incidentLocation: string;
  incidentDate: string; // YYYY-MM-DD
  latitude: string; // Form value (string), converted to number in service
  longitude: string; // Form value (string), converted to number in service
  // Legacy fields - kept for backward compatibility but not used in new flow
  customerName?: string;
  customerPhone?: string;
  initialPlateNumber?: string;
  accidentDate?: string;
  accidentTime?: string;
  description?: string;
  damageDescription?: string;
  address?: string;
  insurancePolicyNumber?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehicleColor?: string;
  adjusterId?: string;
  priority?: ClaimPriority;
  assignmentNotes?: string;
}

// ─── Lookup domain types ──────────────────────────────────────────────────────

export type PolicyStatus = "ACTIVE" | "EXPIRED" | "CANCELLED" | "SUSPENDED";

export interface VehicleInfo {
  plateNumber?: string | null;
  vehicleId?: string | null;
  policyId?: string | null;
  customerId?: string | null;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  color?: string | null;
}

export interface CustomerInfo {
  name: string;
  phone: string;
}

export interface PolicyInfo {
  policyNumber?: string | null;
  status?: PolicyStatus | null;
  startDate?: string | null;
  expiryDate?: string | null;
}

// ─── Policy Verification ──────────────────────────────────────────────────────

export interface PolicyVerificationRequest {
  policyNumber?: string;
  plateNumber?: string;
  incidentDate?: string; // YYYY-MM-DD format
}

export interface PolicyVerificationResponse {
  isEligible: boolean;
  policy: {
    id: string;
    policyNumber: string;
    status: PolicyStatus;
    startDate: string;
    expiryDate: string;
  };
  vehicle: {
    id: string;
    plateNumber: string;
    make?: string;
    model?: string;
    year?: number;
    color?: string;
  };
  customer: {
    id: string;
    name: string;
    phone: string;
  };
}

export type PolicyVerificationErrorCode =
  | "VALIDATION_ERROR"
  | "INVALID_INCIDENT_DATE"
  | "POLICY_NOT_FOUND"
  | "VEHICLE_NOT_FOUND"
  | "POLICY_EXPIRED"
  | "POLICY_CANCELLED"
  | "POLICY_NOT_ACTIVE_ON_DATE"
  | "VEHICLE_MISMATCH";

// ─── Claim details ────────────────────────────────────────────────────────────

export interface ClaimDetails {
  id: string;
  claimNumber: string;
  status: ClaimStatus;

  customer: CustomerInfo;

  vehicle: VehicleInfo;

  policy?: PolicyInfo | null;

  incidentType: string;
  incidentLocation: string;
  incidentCoordinates?: GeoPoint | null; // Reported incident location

  assignment: {
    assignedTo: unknown | null;
    assignedBy: unknown | null;
    assignedAt: string | null;
    priority: "LOW" | "MEDIUM" | "HIGH";
    assignmentNotes: string | null;
  };

  accident: Record<string, unknown> | null;
  location?: GeoPoint | null; // Actual field inspection location (mobile only)
  timeline: Array<Record<string, unknown>>;

  createdAt: string;
  updatedAt: string;
  createdBy?: unknown | null;
  closedBy?: unknown | null;
  closedAt?: string | null;
  closingNotes?: string | null;
}
