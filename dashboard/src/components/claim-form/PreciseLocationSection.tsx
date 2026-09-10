import { MapPin } from "lucide-react";
import FormField from "../ui/FormField";
import Input from "../ui/Input";
import type { ClaimFormSectionProps } from "./claimFormConstants";

interface PreciseLocationSectionProps extends ClaimFormSectionProps {
  open: boolean;
  onToggle: () => void;
}

export default function PreciseLocationSection({
  values,
  errors,
  onChange,
  disabled,
  open,
  onToggle,
}: PreciseLocationSectionProps) {
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
      >
        <MapPin size={16} />
        <span>{open ? "Hide" : "Add"} Precise Location Details</span>
        <span className="text-xs text-text-muted ml-1">(Optional)</span>
      </button>

      {open && (
        <div className="space-y-4 p-4 rounded-lg bg-surface-soft border border-border">
          <FormField label="Street Address" error={errors.address}>
            <Input
              type="text"
              name="address"
              placeholder="Full street address"
              value={values.address || ""}
              onChange={onChange}
              error={errors.address}
              icon={<MapPin size={16} />}
              disabled={disabled}
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Latitude" error={errors.latitude}>
              <Input
                type="number"
                name="latitude"
                placeholder="e.g., 24.7136"
                value={values.latitude || ""}
                onChange={onChange}
                error={errors.latitude}
                disabled={disabled}
                step="any"
              />
              <p className="mt-1 text-xs text-text-muted">Between -90 and 90</p>
            </FormField>

            <FormField label="Longitude" error={errors.longitude}>
              <Input
                type="number"
                name="longitude"
                placeholder="e.g., 46.6753"
                value={values.longitude || ""}
                onChange={onChange}
                error={errors.longitude}
                disabled={disabled}
                step="any"
              />
              <p className="mt-1 text-xs text-text-muted">Between -180 and 180</p>
            </FormField>
          </div>
        </div>
      )}
    </div>
  );
}