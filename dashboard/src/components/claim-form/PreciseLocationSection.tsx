import { AlertCircle, CheckCircle2, MapPin } from "lucide-react";
import LocationMapPicker from "./LocationMapPicker";
import type { ClaimFormSectionProps } from "./claimFormConstants";
import { toMapCoordinates } from "../../utils/map";

// Default focus for the intake picker: the West Bank (same as the dispatch
// map's default center, MapPage DEFAULT_CENTER).
const DEFAULT_CENTER: [number, number] = [31.9, 35.3];

interface PreciseLocationSectionProps extends ClaimFormSectionProps {
  open: boolean;
  onToggle: () => void;
  onSetLocation?: (latitude: number, longitude: number) => void;
}

export default function PreciseLocationSection({
  values,
  errors,
  onChange,
  disabled,
  open,
  onToggle,
  onSetLocation,
}: PreciseLocationSectionProps) {
  const coords = toMapCoordinates(values.latitude, values.longitude);
  const position: [number, number] | null = coords
    ? [coords.latitude, coords.longitude]
    : null;

  const handleSetCoordinates = (lat: number, lng: number) => {
    if (disabled) return;
    const formattedLat = Number(lat.toFixed(6));
    const formattedLng = Number(lng.toFixed(6));

    if (onSetLocation) {
      onSetLocation(formattedLat, formattedLng);
    } else {
      onChange({
        target: { name: "latitude", value: String(formattedLat) },
      } as React.ChangeEvent<HTMLInputElement>);
      onChange({
        target: { name: "longitude", value: String(formattedLng) },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const hasCoordinatesError = Boolean(errors.latitude || errors.longitude);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
      >
        <MapPin size={16} />
        <span>موقع الحادث على الخريطة</span>
        <span className="text-xs text-danger ml-1">* Required</span>
      </button>

      {open && (
        <div className="space-y-4 p-4 rounded-lg bg-surface-soft border border-border">
          <p className="text-xs text-text-muted">
            انقر على الخريطة لتحديد موقع الحادث بالتحديد — سيظهر الدبوس على خريطة
            التوزيع مباشرة بعد إنشاء المطالبة.
          </p>

          {/* Selected incident coordinates badge */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border text-sm">
            <div className="flex items-center gap-2">
              {position ? (
                <>
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span className="font-medium text-text">
                    موقع الحادث المحدد: {position[0].toFixed(5)}, {position[1].toFixed(5)}
                  </span>
                </>
              ) : (
                <>
                  <MapPin size={16} className="text-amber-500 shrink-0" />
                  <span className="text-text-muted">
                    لم يتم تحديد موقع الحادث بعد. انقر على الخريطة أدناه لتحديد الموقع.
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Accessible hidden inputs to maintain form state bindings */}
          <input
            type="text"
            name="latitude"
            className="sr-only"
            aria-hidden="true"
            value={values.latitude || ""}
            onChange={onChange}
          />
          <input
            type="text"
            name="longitude"
            className="sr-only"
            aria-hidden="true"
            value={values.longitude || ""}
            onChange={onChange}
          />

          <LocationMapPicker
            center={position ?? DEFAULT_CENTER}
            selected={position}
            onSelect={handleSetCoordinates}
            disabled={disabled}
          />

          {/* Error messages */}
          {hasCoordinatesError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-danger/20 bg-red-50 px-3 py-2.5 text-sm text-danger"
            >
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>
                {errors.latitude ||
                  errors.longitude ||
                  "Both latitude and longitude incident coordinates are required."}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}