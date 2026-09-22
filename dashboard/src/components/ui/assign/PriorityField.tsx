import FormField from "../FormField";
import Select from "../Select";
import type { ClaimPriority } from "../../../types";
import type { ChangeEvent } from "react";

interface PriorityFieldProps {
  value: ClaimPriority;
  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  disabled?: boolean;
}

const PRIORITY_OPTIONS: Array<{ value: ClaimPriority; label: string }> = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

// The backend treats priority as optional and defaults it to MEDIUM. Preselect
// MEDIUM so the form always reflects the backend default instead of sending an
// empty value.
export const DEFAULT_PRIORITY: ClaimPriority = "MEDIUM";

export default function PriorityField({
  value,
  onChange,
  disabled = false,
}: PriorityFieldProps) {
  return (
    <FormField label="Priority">
      <Select
        name="priority"
        value={value}
        onChange={onChange}
        disabled={disabled}
        options={PRIORITY_OPTIONS}
      />
      <p className="mt-1.5 text-xs text-text-muted">
        Optional in the backend; defaults to Medium.
      </p>
    </FormField>
  );
}