// Lookup domain types + the policy-verification contract.

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

export interface PolicyVerificationRequest {
  policyNumber?: string;
  plateNumber?: string;
  incidentDate?: string; // YYYY-MM-DD format
}

export interface PolicyVerificationResponse {
  isEligible: boolean;
  eligibilityHint?: string; // NEW: explanation for ineligibility or special cases
  policy: {
    id: string;
    policyNumber: string;
    status: PolicyStatus;
    startDate: string;
    expiryDate: string;
    policyType?: string; // NEW: e.g., "COMPREHENSIVE", "THIRD_PARTY"
    coveredPerils?: string[]; // NEW: e.g., ["COLLISION", "THEFT", "FIRE"]
    deductibleAmount?: number; // NEW: deductible amount in policy currency
  };
  // NEW: detailed coverage information - can be null if unavailable
  coverage?: {
    policyType: string;
    effectiveFrom: string;
    effectiveTo: string;
    deductible: number;
    incidents: Array<{
      code: string; // e.g., "COLLISION", "THEFT"
      covered: boolean; // true if this incident type is covered
    }>;
  } | null;
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
    fullName: string; // verification contract uses customer.fullName
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