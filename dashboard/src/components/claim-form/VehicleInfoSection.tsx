import type { ChangeEvent } from "react";
import { Car, FileText } from "lucide-react";
import FormField from "../ui/FormField";
import Input from "../ui/Input";
import FormSectionHeader from "./FormSectionHeader";
import { normalizePlateNumber } from "../../utils/validation";
import type { ClaimFormSectionProps } from "./claimFormConstants";

export default function VehicleInfoSection({
  values,
  errors,
  onChange,
  disabled,
}: ClaimFormSectionProps) {
  return (
    <div className="space-y-4">
      <FormSectionHeader icon={Car} title="Vehicle Information" />

      <FormField
        label="License Plate Number"
        required
        error={errors.initialPlateNumber}
      >
        <Input
          type="text"
          name="initialPlateNumber"
          placeholder="ABC-1234 or ١٢٣٤ أ ب ج"
          value={values.initialPlateNumber}
          onChange={(e) => {
            // Controlled input mapped to initialPlateNumber. Rebuild the
            // event with an explicit name — spreading the native target
            // drops name/value (they are prototype getters) — and normalize
            // the plate value so typing/editing/deleting/pasting stay in sync.
            const { name, value } = e.target;
            onChange({
              target: { name, value: normalizePlateNumber(value) },
            } as ChangeEvent<HTMLInputElement>);
          }}
          error={errors.initialPlateNumber}
          icon={<FileText size={16} />}
          disabled={disabled}
        />
        <p className="mt-1.5 text-xs text-text-muted">
          Enter the vehicle's license plate number as shown on the registration
        </p>
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Vehicle Make">
          <Input
            type="text"
            name="vehicleMake"
            placeholder="e.g., Toyota"
            value={values.vehicleMake || ""}
            onChange={onChange}
            disabled={disabled}
          />
        </FormField>

        <FormField label="Vehicle Model">
          <Input
            type="text"
            name="vehicleModel"
            placeholder="e.g., Camry"
            value={values.vehicleModel || ""}
            onChange={onChange}
            disabled={disabled}
          />
        </FormField>

        <FormField label="Vehicle Year">
          <Input
            type="number"
            name="vehicleYear"
            placeholder="e.g., 2022"
            value={values.vehicleYear || ""}
            onChange={onChange}
            disabled={disabled}
            min={1900}
            max={new Date().getFullYear() + 1}
          />
        </FormField>

        <FormField label="Vehicle Color">
          <Input
            type="text"
            name="vehicleColor"
            placeholder="e.g., White"
            value={values.vehicleColor || ""}
            onChange={onChange}
            disabled={disabled}
          />
        </FormField>
      </div>
      <p className="-mt-1 text-xs text-text-muted">
        Optional vehicle details — pending backend support. Not synced to the server yet.
      </p>
    </div>
  );
}