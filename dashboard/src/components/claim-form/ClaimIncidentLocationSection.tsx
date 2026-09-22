import { useState } from "react";
import { MapPin, CheckCircle } from "lucide-react";
import FormSectionHeader from "./FormSectionHeader";
import Button from "../ui/Button";
import IncidentLocationPicker from "../ui/IncidentLocationPicker";
import type { ClaimFormSectionProps } from "./claimFormConstants";

/**
 * Incident location section for claim intake.
 * 
 * Uses IncidentLocationPicker for map-based location selection.
 * Does NOT use navigator.geolocation.
 * This is the reported accident location, not the Claims Officer's location.
 * 
 * Required: latitude and longitude must be selected before claim submission.
 */
export default function ClaimIncidentLocationSection({
  values,
  errors,
  onChange,
  disabled,
}: ClaimFormSectionProps) {
  const [showPicker, setShowPicker] = useState(false);

  const hasLocation = Boolean(
    values.latitude &&
      values.longitude &&
      !errors.latitude &&
      !errors.longitude,
  );

  const handleLocationSelect = (latitude: number, longitude: number) => {
    // Trigger form onChange for both fields
    onChange({
      target: { name: "latitude", value: String(latitude) },
    } as React.ChangeEvent<HTMLInputElement>);
    onChange({
      target: { name: "longitude", value: String(longitude) },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const currentLocation =
    hasLocation && values.latitude && values.longitude
      ? {
          latitude: Number(values.latitude),
          longitude: Number(values.longitude),
        }
      : null;

  return (
    <div className="space-y-4">
      <FormSectionHeader
        title="📍 موقع الحادث"
        subtitle="حدد موقع الحادث المُبلغ عنه على الخريطة"
      />

      <div className="rounded-lg border border-border bg-surface p-4">
        {hasLocation ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-emerald-700">
              <CheckCircle size={16} className="flex-shrink-0" />
              <span className="font-medium">تم تحديد موقع الحادث</span>
            </div>

            <div className="text-xs text-text-muted space-y-1">
              <p>
                <span className="font-medium">خط العرض:</span>{" "}
                {Number(values.latitude).toFixed(6)}
              </p>
              <p>
                <span className="font-medium">خط الطول:</span>{" "}
                {Number(values.longitude).toFixed(6)}
              </p>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowPicker(true)}
              disabled={disabled}
            >
              <MapPin size={14} />
              تعديل الموقع
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-text-muted">
              الرجاء تحديد موقع الحادث المُبلغ عنه على الخريطة
            </p>

            <Button
              type="button"
              variant="primary"
              onClick={() => setShowPicker(true)}
              disabled={disabled}
            >
              <MapPin size={16} />
              🗺️ تحديد موقع الحادث على الخريطة
            </Button>

            {(errors.latitude || errors.longitude) && (
              <p className="text-sm text-danger">
                {errors.latitude || errors.longitude}
              </p>
            )}
          </div>
        )}
      </div>

      <IncidentLocationPicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleLocationSelect}
        initialLocation={currentLocation}
      />
    </div>
  );
}
