"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap } from "react-leaflet";
import type { CircleMarker as LeafletCircleMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { LocationData, LocationEntry } from "./actions";

interface MapComponentProps {
  location: LocationData;
  history: LocationEntry[];
  focusEntry?: LocationEntry | null;
}

function FlyToAndOpen({
  entry,
  markerRefs,
}: {
  entry: LocationEntry | null | undefined;
  markerRefs: React.RefObject<Record<string, LeafletCircleMarker | null>>;
}) {
  const map = useMap();
  useEffect(() => {
    if (entry) {
      map.flyTo([entry.lat, entry.lon], Math.max(map.getZoom(), 8), { duration: 1.2 });
      markerRefs.current[entry.arrivedAt]?.openPopup();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry]);
  return null;
}

function AutoOpen({ markerRef }: { markerRef: React.RefObject<LeafletCircleMarker | null> }) {
  useEffect(() => {
    const t = setTimeout(() => markerRef.current?.openPopup(), 100);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

function formatPopupTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MapComponent({ location, history, focusEntry }: MapComponentProps) {
  const markerRefs = useRef<Record<string, LeafletCircleMarker | null>>({});
  const currentMarkerRef = useRef<LeafletCircleMarker | null>(null);

  // Fix Leaflet default icon path issue in Next.js
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet");
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/leaflet/marker-icon-2x.png",
      iconUrl: "/leaflet/marker-icon.png",
      shadowUrl: "/leaflet/marker-shadow.png",
    });
  }, []);

  // Build polyline from history + current location
  const trail: [number, number][] = [
    ...history.map((e) => [e.lat, e.lon] as [number, number]),
    [location.lat, location.lon],
  ];

  return (
    <MapContainer
      center={[location.lat, location.lon]}
      zoom={13}
      style={{ height: "100%", width: "100%", background: "#111" }}
      zoomControl={true}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      <FlyToAndOpen entry={focusEntry} markerRefs={markerRefs} />
      <AutoOpen markerRef={currentMarkerRef} />

      {/* Trail line connecting past locations */}
      {trail.length > 1 && (
        <Polyline
          positions={trail}
          pathOptions={{ color: "#4d9fff", weight: 1.5, opacity: 0.4, dashArray: "4 6" }}
        />
      )}

      {/* History location dots */}
      {history.map((entry) => (
        <CircleMarker
          key={entry.arrivedAt}
          ref={(el) => { markerRefs.current[entry.arrivedAt] = el; }}
          center={[entry.lat, entry.lon]}
          radius={3}
          pathOptions={{
            color: "#4d9fff",
            fillColor: "#4d9fff",
            fillOpacity: 0.5,
            weight: 0,
          }}
        >
          <Popup className="dark-popup">
            <div className="popup-city">{entry.city}</div>
            <div className="popup-time">arrived {formatPopupTime(entry.arrivedAt)}</div>
          </Popup>
        </CircleMarker>
      ))}

      {/* Current location dot */}
      <CircleMarker
        ref={currentMarkerRef}
        center={[location.lat, location.lon]}
        radius={8}
        pathOptions={{
          color: "#4d9fff",
          fillColor: "#4d9fff",
          fillOpacity: 1,
          weight: 0,
        }}
      >
        <Popup className="dark-popup">
          <div className="popup-city">{location.city}</div>
          <div className="popup-time">updated {formatPopupTime(location.updatedAt)}</div>
        </Popup>
      </CircleMarker>

      {/* Pulse ring */}
      <CircleMarker
        center={[location.lat, location.lon]}
        radius={16}
        pathOptions={{
          color: "#4d9fff",
          fillColor: "transparent",
          fillOpacity: 0,
          weight: 1,
          opacity: 0.3,
        }}
      />
    </MapContainer>
  );
}
