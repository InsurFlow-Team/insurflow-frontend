import { FileText } from "lucide-react";
import FormField from "../ui/FormField";
import FormSectionHeader from "./FormSectionHeader";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_DAMAGE_LENGTH,
} from "./claimFormConstants";
import type { ClaimFormSectionProps } from "./claimFormConstants";

const TEXTAREA_CLASS_NAME = (hasError: boolean) => `
  w-full rounded-lg border bg-background text-sm text-text
  px-4 py-2.5 placeholder:text-text-muted/50
  focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
  disabled:opacity-50 disabled:cursor-not-allowed
  transition duration-150 resize-none
  ${hasError ? "border-danger focus:ring-danger/40 focus:border-danger" : "border-border"}
`;

export default function AccidentDescriptionSection({
  values,
  errors,
  onChange,
  disabled,
}: ClaimFormSectionProps) {
  return (
    <div className="space-y-4">
      <FormSectionHeader icon={FileText} title="Accident Description" />

      <FormField label="What Happened?" required error={errors.description}>
        <div className="relative">
          <textarea
            name="description"
            value={values.description}
            onChange={onChange}
            placeholder="Provide a detailed description of how the incident occurred. Include events leading up to the accident, what happened during, and immediate aftermath..."
            rows={4}
            maxLength={MAX_DESCRIPTION_LENGTH}
            disabled={disabled}
            className={TEXTAREA_CLASS_NAME(Boolean(errors.description))}
          />
          <div className="absolute bottom-2 right-2 text-xs text-text-muted">
            {values.description.length}/{MAX_DESCRIPTION_LENGTH}
          </div>
        </div>
        <p className="mt-1.5 text-xs text-text-muted">
          Minimum 20 characters. Be as specific as possible.
        </p>
      </FormField>

      <FormField label="Damage Description" required error={errors.damageDescription}>
        <div className="relative">
          <textarea
            name="damageDescription"
            value={values.damageDescription}
            onChange={onChange}
            placeholder="Describe visible damage to the vehicle. Include affected parts, severity, and any other observations..."
            rows={3}
            maxLength={MAX_DAMAGE_LENGTH}
            disabled={disabled}
            className={TEXTAREA_CLASS_NAME(Boolean(errors.damageDescription))}
          />
          <div className="absolute bottom-2 right-2 text-xs text-text-muted">
            {values.damageDescription.length}/{MAX_DAMAGE_LENGTH}
          </div>
        </div>
        <p className="mt-1.5 text-xs text-text-muted">
          Minimum 10 characters. List damaged parts and severity.
        </p>
      </FormField>
    </div>
  );
}