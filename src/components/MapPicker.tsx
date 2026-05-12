"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState, useEffect } from "react";

// Fix for default Leaflet icons in Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialPos?: [number, number];
}

export default function MapPicker({ onLocationSelect, initialPos = [36.7538, 3.0588] }: MapPickerProps) {
  const [position, setPosition] = useState<[number, number]>(initialPos);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      },
    });

    return position === null ? null : (
      <Marker position={position}>
        <Popup>موقع ورشتك / عملك</Popup>
      </Marker>
    );
  }

  return (
    <div style={{ height: "300px", width: "100%", borderRadius: "12px", overflow: "hidden", border: "1.5px solid rgba(200,149,108,0.3)" }}>
      <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
      </MapContainer>
      <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.5rem", textAlign: "center" }}>
        📍 اضغط على الخريطة لتحديد موقعك بالضبط
      </p>
    </div>
  );
}
