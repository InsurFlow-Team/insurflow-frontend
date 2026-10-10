import FormField from "../FormField";
import Select from "../Select";
import type { ClaimPriority } from "../../../types";
import type { ChangeEvent } from "react";
import { useTranslation } from "../../../i18n/context";

interface PriorityFieldProps {
  value: ClaimPriority;
  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  disabled?: boolean;
}

// The backend treats priority as optional and defaults it to MEDIUM. Preselect
// MEDIUM so the form always reflects the backend default instead of sending an
// empty value.
export const DEFAULT_PRIORITY: ClaimPriority = "MEDIUM";

export default function PriorityField({
  value,
  onChange,
  disabled = false,
}: PriorityFieldProps) {
  const { t } = useTranslation();
  const priorityOptions: Array<{ value: ClaimPriority; label: string }> = [
    { value: "LOW", label: t("assign.priority.low") },
    { value: "MEDIUM", label: t("assign.priority.medium") },
    { value: "HIGH", label: t("assign.priority.high") },
  ];

  return (
    <FormField label={t("assign.priority.label")}>
      <Select
        name="priority"
        value={value}
        onChange={onChange}
        disabled={disabled}
        options={priorityOptions}
      />
      <p className="mt-1.5 text-xs text-text-muted">
        {t("assign.priority.hint")}
      </p>
    </FormField>
  );
}