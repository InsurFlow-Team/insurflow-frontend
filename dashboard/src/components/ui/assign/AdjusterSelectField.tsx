import { RefreshCw } from "lucide-react";
import type { ChangeEvent } from "react";
import FormField from "../FormField";
import Select from "../Select";
import Button from "../Button";
import InlineError from "../InlineError";
import { formatAdjusterSelectLabel } from "../../../utils/adjusters";
import { useTranslation } from "../../../i18n/context";
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
  const { t } = useTranslation();

  return (
    <FormField label={t("assign.fieldAdjuster")} required error={fieldError}>
      {loading ? (
        <Select
          name="adjusterId"
          value={value}
          disabled
          placeholder={t("assign.loadingAdjusters")}
          options={[]}
        />
      ) : loadError ? (
        <div className="space-y-3">
          <InlineError message={loadError} />
          <Button type="button" variant="secondary" onClick={onRetry}>
            <RefreshCw size={15} />
            {t("common.retry")}
          </Button>
        </div>
      ) : !hasAdjusters ? (
        <div
          role="status"
          className="rounded-lg border border-border bg-surface-soft px-3 py-2.5 text-sm text-text-muted"
        >
          {t("assign.noAdjusters")}
        </div>
      ) : (
        <Select
          name="adjusterId"
          value={value}
          onChange={onChange}
          disabled={disabled}
          error={fieldError}
          placeholder={t("assign.selectAdjuster")}
          options={adjusters.map((adjuster) => ({
            value: adjuster.id,
            label: formatAdjusterSelectLabel(adjuster, {
              available: t("map.available"),
              busy: t("map.busy"),
            }),
          }))}
        />
      )}
    </FormField>
  );
}