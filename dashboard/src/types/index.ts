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
  customerName: string;
  customerPhone: string;
  initialPlateNumber: string;
  incidentType: string;
  incidentLocation: string;
  accidentDate: string;
  accidentTime: string;
  description: string;
  damageDescription: string;
  address: string;
  latitude: string;
  longitude: string;
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

// ─── Claim details ────────────────────────────────────────────────────────────

export interface ClaimDetails {
  id: string;
  claimNumber: string;
  status: ClaimStatus;

  customer: CustomerInfo;

  vehicle: VehicleInfo;

  policy?: PolicyInfo;

  incidentType: string;
  incidentLocation: string;

  assignment: {
    assignedTo: unknown | null;
    assignedBy: unknown | null;
    assignedAt: string | null;
    priority: "LOW" | "MEDIUM" | "HIGH";
    assignmentNotes: string | null;
  };

  accident: Record<string, unknown> | null;
  location: Record<string, unknown> | null;
  timeline: Array<Record<string, unknown>>;
  evidence?: Array<Record<string, unknown>>;
attachments?: Array<Record<string, unknown>>;
signature?: Record<string, unknown> | null;
decisions?: Array<Record<string, unknown>>;
correctionNotes?: Array<Record<string, unknown>>;

  createdAt: string;
  updatedAt: string;
}
