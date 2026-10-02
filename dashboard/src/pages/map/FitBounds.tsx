import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function FitBounds({
  center,
  zoom = 14,
}: {
  center?: [number, number];
  zoom?: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 0.5 });
    }
  }, [map, center, zoom]);

  return null;
}