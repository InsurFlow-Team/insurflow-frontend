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

// Module-level constants so useForm receives referentially stable initial
// values and validators. Keeping them inline used to recreate both on every
// render, which made useForm's reset/handleChange identities change every
// render and loop the resetEffect ("Maximum update depth exceeded").
export const INITIAL_FORM_STATE: NewClaimData = {
  customerName: "",
  customerPhone: "",
  insurancePolicyNumber: "",
  initialPlateNumber: "",
  vehicleMake: "",
  vehicleModel: "",
  vehicleYear: "",
  vehicleColor: "",
  incidentType: "",
  incidentLocation: "",
  accidentDate: "",
  accidentTime: "",
  description: "",
  damageDescription: "",
  address: "",
  latitude: "",
  longitude: "",
  adjusterId: "",
  // Backend treats priority as optional and defaults it to MEDIUM. Preselect
  // MEDIUM so creation with an adjuster never blocks on an empty priority.
  priority: "MEDIUM",
  assignmentNotes: "",
};

export const FORM_VALIDATORS: Partial<
  Record<keyof NewClaimData, (value: string) => string | null>
> = {
  customerName: validateRequired,
  customerPhone: validatePhone,
  initialPlateNumber: validatePlateNumber,
  incidentType: validateIncidentType,
  incidentLocation: validateRequired,
  accidentDate: validateRequired,
  accidentTime: validateRequired,
  description: (value) => validateDescription(value, 20),
  damageDescription: (value) => validateDescription(value, 10),
  latitude: (value) => validateCoordinate(value, "latitude"),
  longitude: (value) => validateCoordinate(value, "longitude"),
};

export interface ClaimFormSectionProps {
  values: NewClaimData;
  errors: FormErrors;
  onChange: FieldChangeHandler;
  disabled: boolean;
}