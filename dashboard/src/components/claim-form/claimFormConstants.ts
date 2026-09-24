import type { ChangeEvent } from "react";
import {
  validateRequired,
  validateIncidentType,
  validateCoordinate,
} from "../../utils/validation";

// Model of exactly what the Create Claim intake form collects. Customer and
// vehicle identity are NOT part of the model: they are verified-policy data and
// are never edited in the intake (see VerifiedPolicySummary). policyId and
// plateNumber are merged into the request at submit time from the verified
// policy (ClaimsList), not from the form. The reported location is collected as
// BOTH a place description (incidentLocation, e.g. "شارع الملك فهد") and a
// mandatory map pin (latitude/longitude) the officer drops on the intake map —
// no geocoding of the text is needed, and the pinned claim renders on the
// dispatch map immediately (2026-09-20 ruling, restored 2026-09-24).
export interface NewClaimData {
  incidentType: string;
  incidentLocation: string; // Place description
  incidentDate: string; // YYYY-MM-DD
  latitude: string; // Form value (string), converted to number in the service
  longitude: string; // Form value (string), converted to number in the service
}

export type FormErrors = Partial<Record<keyof NewClaimData, string>>;

export type FieldChangeHandler = (
  e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
) => void;

export const INCIDENT_TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "COLLISION", label: "Collision" },
  { value: "REAR_END_COLLISION", label: "Rear-End Collision" },
  { value: "SIDE_IMPACT", label: "Side Impact" },
  { value: "PARKING_DAMAGE", label: "Parking Damage" },
  { value: "OTHER", label: "Other" },
];

// Module-level constant so useForm receives referentially stable initial
// values; keeping it inline used to recreate it every render and loop the
// resetEffect ("Maximum update depth exceeded").
export const INITIAL_FORM_STATE: NewClaimData = {
  incidentType: "",
  incidentLocation: "",
  incidentDate: "",
  latitude: "",
  longitude: "",
};

export const FORM_VALIDATORS: Partial<
  Record<keyof NewClaimData, (value: string) => string | null>
> = {
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