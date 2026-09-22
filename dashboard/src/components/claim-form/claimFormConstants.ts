import type { ChangeEvent } from "react";
import {
  validateRequired,
  validatePhone,
  validatePlateNumber,
  validateIncidentType,
  validateDescription,
  validateCoordinate,
} from "../../utils/validation";
import type { ClaimPriority, CreateClaimDraft } from "../../types";

// Full claim domain. Backend-supported fields are sent to POST /claims; the
// remaining (frontend-only) fields stay in the model until the backend supports
// them (see toCreateClaimRequest in claims.service.ts).
export type NewClaimData = CreateClaimDraft;

export type FormErrors = Partial<Record<keyof NewClaimData, string>>;

export type FieldChangeHandler = (
  e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
) => void;

export const PRIORITY_OPTIONS: Array<{ value: ClaimPriority; label: string }> = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

export const INCIDENT_TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "COLLISION", label: "Collision" },
  { value: "REAR_END_COLLISION", label: "Rear-End Collision" },
  { value: "SIDE_IMPACT", label: "Side Impact" },
  { value: "PARKING_DAMAGE", label: "Parking Damage" },
  { value: "OTHER", label: "Other" },
];

export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_DAMAGE_LENGTH = 300;
export const MAX_ASSIGNMENT_NOTES_LENGTH = 300;

const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;

export function isPrioritySelected(priority: ClaimPriority | undefined) {
  return Boolean(priority) && VALID_PRIORITIES.includes(priority as ClaimPriority);
}

// Initial form state for new claim intake flow.
// After policy verification, policyId and plateNumber are set from verified data.
export const INITIAL_FORM_STATE: NewClaimData = {
  policyId: "",
  plateNumber: "",
  incidentType: "",
  incidentLocation: "",
  incidentDate: "",
  latitude: "",
  longitude: "",
};

// Validators for required fields in new claim intake flow
export const FORM_VALIDATORS: Partial<
  Record<keyof NewClaimData, (value: string) => string | null>
> = {
  policyId: validateRequired,
  plateNumber: validatePlateNumber,
  incidentType: validateIncidentType,
  incidentLocation: validateRequired,
  incidentDate: validateRequired,
  latitude: (value) => validateCoordinate(value, "latitude"),
  longitude: (value) => validateCoordinate(value, "longitude"),
};

export interface ClaimFormSectionProps {
  values: NewClaimData;
  errors: FormErrors;
  onChange: FieldChangeHandler;
  disabled: boolean;
}