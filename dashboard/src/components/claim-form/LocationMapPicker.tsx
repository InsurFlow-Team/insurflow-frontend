import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

const pickerIcon = L.divIcon({
  className: "",
  html: `<div role="img" aria-label="Selected Incident Location" style="width:20px;height:20px;border-radius:50%;background:#EF4444;border:3px solid #ffffff;box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface LocationMapPickerProps {
  center: [number, number];
  selected: [number, number] | null;
  onSelect: (latitude: number, longitude: number) => void;
  disabled?: boolean;
}

function MapEventsHandler({
  onSelect,
  centerPosition,
}: {
  onSelect: (lat: number, lng: number) => void;
  centerPosition: [number, number] | null;
}) {
  const map = useMap();

  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (centerPosition) {
      map.flyTo(centerPosition, map.getZoom() > 12 ? map.getZoom() : 14, {
        duration: 0.5,
      });
    }
  }, [map, centerPosition]);

  return null;
}

export default function LocationMapPicker({
  center,
  selected,
  onSelect,
  disabled = false,
}: LocationMapPickerProps) {
  return (
    <div className="relative h-64 w-full rounded-lg border border-border overflow-hidden shadow-inner">
      <MapContainer
        center={center}
        zoom={selected ? 14 : 11}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEventsHandler onSelect={onSelect} centerPosition={selected} />
        {selected && (
          <Marker
            position={selected}
            icon={pickerIcon}
            draggable={!disabled}
            eventHandlers={{
              dragend(e) {
                const latLng = (e.target as L.Marker).getLatLng();
                onSelect(latLng.lat, latLng.lng);
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}