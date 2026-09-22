import { useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { MapPin, X } from "lucide-react";
import "leaflet/dist/leaflet.css";
import Button from "./Button";

// Default center: Riyadh
const DEFAULT_CENTER: [number, number] = [24.7136, 46.6753];
const DEFAULT_ZOOM = 12;

// Custom marker icon for incident location
const incidentMarkerIcon = L.divIcon({
  className: "",
  html: `<div role="img" aria-label="موقع الحادث" style="width:20px;height:20px;border-radius:50%;background:#EF4444;border:3px solid #ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

interface MapClickHandlerProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

function MapClickHandler({ onLocationSelect }: MapClickHandlerProps) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface IncidentLocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (latitude: number, longitude: number) => void;
  initialLocation?: { latitude: number; longitude: number } | null;
}

/**
 * Map picker for selecting incident location.
 * 
 * This component allows Claims Officer to select the reported accident location
 * on a map. The officer clicks on the map to place a marker at the incident
 * location.
 * 
 * IMPORTANT: This is NOT the officer's current location. This is the reported
 * accident location ("موقع الحادث المُبلغ عنه").
 * 
 * Do NOT use navigator.geolocation here.
 */
export default function IncidentLocationPicker({
  isOpen,
  onClose,
  onSelect,
  initialLocation,
}: IncidentLocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(
    initialLocation
      ? { lat: initialLocation.latitude, lng: initialLocation.longitude }
      : null,
  );

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
  }, []);

  const handleConfirm = () => {
    if (selectedLocation) {
      onSelect(selectedLocation.lat, selectedLocation.lng);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedLocation(
      initialLocation
        ? { lat: initialLocation.latitude, lng: initialLocation.longitude }
        : null,
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-4xl max-h-[90vh] m-4 bg-surface rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-surface-soft">
          <div>
            <h2 className="text-lg font-bold text-text">تحديد موقع الحادث</h2>
            <p className="text-sm text-text-muted mt-1">
              انقر على الخريطة لتحديد موقع الحادث المُبلغ عنه
            </p>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-surface transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        {/* Map */}
        <div className="flex-1 relative min-h-[400px]">
          <MapContainer
            center={
              selectedLocation
                ? [selectedLocation.lat, selectedLocation.lng]
                : DEFAULT_CENTER
            }
            zoom={selectedLocation ? 15 : DEFAULT_ZOOM}
            scrollWheelZoom
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapClickHandler onLocationSelect={handleLocationSelect} />

            {selectedLocation && (
              <Marker
                position={[selectedLocation.lat, selectedLocation.lng]}
                icon={incidentMarkerIcon}
              />
            )}
          </MapContainer>

          {/* Instructions overlay */}
          {!selectedLocation && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
              <div className="bg-surface/95 border border-border rounded-lg shadow-lg px-4 py-3 flex items-center gap-2">
                <MapPin size={18} className="text-primary flex-shrink-0" />
                <p className="text-sm text-text">
                  انقر على الخريطة لتحديد الموقع
                </p>
              </div>
            </div>
          )}

          {/* Selected location info */}
          {selectedLocation && (
            <div className="absolute bottom-4 left-4 z-[1000] bg-surface/95 border border-border rounded-lg shadow-lg px-4 py-3">
              <p className="text-xs text-text-muted">الإحداثيات المحددة:</p>
              <p className="text-sm text-text font-mono mt-1">
                {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border bg-surface-soft flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={handleCancel}>
            إلغاء
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirm}
            disabled={!selectedLocation}
          >
            تأكيد الموقع
          </Button>
        </div>
      </div>
    </div>
  );
}
