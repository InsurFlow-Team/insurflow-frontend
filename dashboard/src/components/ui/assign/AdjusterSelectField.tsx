import { RefreshCw } from "lucide-react";
import type { ChangeEvent } from "react";
import FormField from "../FormField";
import Select from "../Select";
import Button from "../Button";
import InlineError from "../InlineError";
import { formatAdjusterSelectLabel } from "../../../utils/adjusters";
import type { FieldAdjuster } from "../../../types";

interface AdjusterSelectFieldProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  disabled: boolean;
  loading: boolean;
  loadError: string | null;
  hasAdjusters: boolean;
  adjusters: FieldAdjuster[];
  fieldError?: string;
  onRetry: () => void;
}

export default function AdjusterSelectField({
  value,
  onChange,
  disabled,
  loading,
  loadError,
  hasAdjusters,
  adjusters,
  fieldError,
  onRetry,
}: AdjusterSelectFieldProps) {
  return (
    <FormField label="Field Adjuster" required error={fieldError}>
      {loading ? (
        <Select
          name="adjusterId"
          value={value}
          disabled
          placeholder="Loading field adjusters..."
          options={[]}
        />
      ) : loadError ? (
        <div className="space-y-3">
          <InlineError message={loadError} />
          <Button type="button" variant="secondary" onClick={onRetry}>
            <RefreshCw size={15} />
            Retry
          </Button>
        </div>
      ) : !hasAdjusters ? (
        <div
          role="status"
          className="rounded-lg border border-border bg-surface-soft px-3 py-2.5 text-sm text-text-muted"
        >
          No available field adjusters. This claim can be assigned later once
          an adjuster becomes available.
        </div>
      ) : (
        <Select
          name="adjusterId"
          value={value}
          onChange={onChange}
          disabled={disabled}
          error={fieldError}
          placeholder="Select field adjuster"
          options={adjusters.map((adjuster) => ({
            value: adjuster.id,
            label: formatAdjusterSelectLabel(adjuster),
          }))}
        />
      )}
    </FormField>
  );
}