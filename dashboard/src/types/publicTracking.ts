/**
 * Public Tracking Types
 * 
 * Types for the customer-facing public tracking page.
 * No authentication required - access via secure tracking token only.
 */

/**
 * Simplified claim status for public display (in Arabic)
 */
export type PublicClaimStatus =
  | "PENDING" // قيد الانتظار
  | "UNDER_REVIEW" // قيد المراجعة
  | "IN_PROGRESS" // جارٍ العمل
  | "COMPLETED" // مكتملة
  | "REJECTED"; // مرفوضة

/**
 * Public timeline event - sanitized version with no sensitive data
 */
export interface PublicTimelineEvent {
  action: string; // Action name in Arabic
  timestamp: string; // ISO timestamp
  notes?: string; // Public notes (sanitized)
}

/**
 * Public claim details response
 * Contains only customer-visible information, no internal data
 */
export interface PublicClaimDetails {
  claimNumber: string; // e.g., "CLM-2026-0001"
  status: PublicClaimStatus; // Current status
  statusDescription: string; // Arabic description
  
  // Vehicle info (partially masked)
  vehicleMake: string | null; // e.g., "Toyota"
  vehicleModel: string | null; // e.g., "Camry"
  plateNumber: string; // Partially masked: "ABC-***"
  
  // Incident info
  incidentType: string; // e.g., "حادث مروري"
  incidentDate: string | null; // Date only (no time)
  
  // Timeline
  timeline: PublicTimelineEvent[];
  
  // Timestamps
  createdAt: string; // ISO timestamp
  lastUpdatedAt: string; // ISO timestamp
}

/**
 * Error codes for public tracking
 */
export type PublicTrackingError =
  | "CLAIM_NOT_FOUND" // Invalid or expired token
  | "TOO_MANY_REQUESTS" // Rate limit exceeded
  | "SERVER_ERROR"; // Generic server error
