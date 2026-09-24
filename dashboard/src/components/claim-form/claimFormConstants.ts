import type { ChangeEvent } from "react";
import { validateRequired, validateIncidentType } from "../../utils/validation";

// Model of exactly what the Create Claim intake form collects. Customer and
// vehicle identity are NOT part of the model: they are verified-policy data and
// are never edited in the intake (see VerifiedPolicySummary). policyId and
// plateNumber are merged into the request at submit time from the verified
// policy (ClaimsList), not from the form. Incident location is descriptive
// TEXT only — no coordinates are collected in the intake (ruling 2026-09-24);
// the dispatch map renders text-only incidents from incidentLocation.
export interface NewClaimData {
  incidentType: string;
  incidentLocation: string;
  incidentDate: string; // YYYY-MM-DD
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
};

export const FORM_VALIDATORS: Partial<
  Record<keyof NewClaimData, (value: string) => string | null>
> = {
  incidentType: validateIncidentType,
  incidentLocation: validateRequired,
  incidentDate: validateRequired,
};

export interface ClaimFormSectionProps {
  values: NewClaimData;
  errors: FormErrors;
  onChange: FieldChangeHandler;
  disabled: boolean;
}