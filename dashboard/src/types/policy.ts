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