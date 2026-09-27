import type { ClaimPriority, ClaimStatus, GeoPoint } from "./core";
import type { UserSummary } from "./user";

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
  // Sent by GET /claims so a claim can be traced back to its adjuster without
  // a per-adjuster endpoint. Absent on unassigned claims.
  assignedTo?: UserSummary | null;
}

// ─── Adjuster work history (GET /claims + GET /claims/:id) ───────────────────

// A claim counts as completed once a final decision was made: approved and
// rejected both end the adjuster's part of the work, and closed means settled.
// The runtime list lives in utils/adjusterHistory.ts; this barrel is types-only.

export interface AdjusterWorkHistoryEntry {
  claimId: string;
  claimNumber: string;
  status: ClaimStatus;
  customerName: string;
  plateNumber: string | null;
  // null when the claim details could not be hydrated — the UI shows "—" rather
  // than inventing a number.
  inspectionCount: number | null;
  evidenceCount: number | null;
  completedAt: string | null;
  durationHours: number | null;
}

export interface AdjusterWorkHistory {
  entries: AdjusterWorkHistoryEntry[];
  // Counts every completed claim for the adjuster, even when only the most
  // recent ones are hydrated into `entries`.
  totalCompleted: number;
  // true when `entries` is a capped slice and older claims were left out.
  truncated: boolean;
}

export interface CreateClaimDraft {
  policyId: string; // Required: comes from policy verification
  plateNumber: string; // Required: verified plate number
  incidentType: string;
  incidentLocation: string; // Place description, e.g. "شارع الملك فهد، بالقرب من..."
  incidentDate: string; // YYYY-MM-DD
  latitude?: string; // Form value (string), converted to number in the service
  longitude?: string; // Form value (string), converted to number in the service
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

// ─── Claim details (GET /claims/:claimId) ─────────────────────────────────────

// Strongly typed shapes matching the backend contract. The single source of
// truth for the Claim Details page: nothing here is fetched client-side.

export interface CustomerDetails {
  name: string | null;
  phone: string | null;
}

export interface VehicleDetails {
  plateNumber: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
  color: string | null;
}

export interface PolicyDetails {
  id: string;
  policyNumber: string | null;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | null;
  startDate: string | null;
  expiryDate: string | null;
}

export type AssignmentPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface AssignmentDetails {
  assignedTo: UserSummary | null;
  assignedBy: UserSummary | null;
  assignedAt: string | null;
  priority: AssignmentPriority | null;
  assignmentNotes: string | null;
}

export interface AccidentDetails {
  accidentType: string | null;
  accidentDate: string | null;
  accidentTime: string | null;
  description?: string | null;
  damageDescription?: string | null;
}

export interface LocationDetails {
  latitude: number | null;
  longitude: number | null;
  address?: string | null;
  capturedAt: string | null;
}

export interface IncidentCoordinates {
  latitude: number;
  longitude: number;
  capturedAt: string;
}

export interface EvidenceItem {
  imageType: string;
  url: string;
  uploadedBy: UserSummary | null;
  uploadedAt: string;
}

export interface SignatureDetails {
  url: string;
  capturedBy: string | null;
  capturedAt: string | null;
}

export interface TimelineItem {
  action: string;
  previousStatus: string | null;
  newStatus: string | null;
  notes: string | null;
  reason?: string | null; // decline events carry the adjuster's reason
  performedBy: UserSummary | null;
  role: string;
  timestamp: string;
}

export interface ClaimDetailsResponse {
  id: string;
  claimNumber: string;
  status: ClaimStatus;

  incidentType: string;
  incidentLocation: string;
  incidentCoordinates: IncidentCoordinates | null;

  createdAt: string;
  updatedAt: string;

  customer: CustomerDetails;
  vehicle: VehicleDetails;
  policy: PolicyDetails | null;
  assignment: AssignmentDetails;
  accident: AccidentDetails | null;
  location: LocationDetails | null;
  evidence: EvidenceItem[];
  signature: SignatureDetails | null;

  decisionNotes: string | null;
  closedBy: string | null;
  closedAt: string | null;
  closingNotes: string | null;

  timeline: TimelineItem[];
  createdBy: UserSummary | null;
}

// Backwards-compatible name kept for the existing page/components/imports.
export type ClaimDetails = ClaimDetailsResponse;