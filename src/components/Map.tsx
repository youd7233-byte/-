"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapProps {
  artisans?: {
    id: string;
    lat: number;
    lng: number;
    profession: string;
    name: string;
    userId: string;
  }[];
  interactive?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  defaultCenter?: [number, number];
  selectedLocation?: { lat: number; lng: number } | null;
}

function LocationMarker({ onSelect, selectedLocation }: { onSelect?: (lat: number, lng: number) => void, selectedLocation?: {lat: number, lng: number} | null }) {
  const [position, setPosition] = useState<L.LatLng | null>(
    selectedLocation ? new L.LatLng(selectedLocation.lat, selectedLocation.lng) : null
  );
  
  useMapEvents({
    click(e) {
      if (onSelect) {
        setPosition(e.latlng);
        onSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>موقعك المحدد</Popup>
    </Marker>
  );
}

export default function Map({ artisans = [], interactive = false, onLocationSelect, defaultCenter = [36.75, 3.05], selectedLocation }: MapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ height: "400px", background: "#e5e7eb", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>جاري تحميل الخريطة...</div>;

  return (
    <div style={{ height: "100%", width: "100%", borderRadius: "16px", overflow: "hidden", border: "2px solid rgba(200,149,108,0.3)" }}>
      <MapContainer 
        center={defaultCenter} 
        zoom={6} 
        scrollWheelZoom={interactive} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {interactive && (
          <LocationMarker onSelect={onLocationSelect} selectedLocation={selectedLocation} />
        )}

        {!interactive && artisans.map(artisan => (
          artisan.lat && artisan.lng ? (
            <Marker key={artisan.id} position={[artisan.lat, artisan.lng]}>
              <Popup>
                <div style={{ textAlign: "center", fontFamily: "inherit" }}>
                  <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{artisan.name}</div>
                  <div style={{ color: "var(--terracotta)", marginBottom: "0.5rem" }}>{artisan.profession}</div>
                  <a href={`/artisan/${artisan.userId}`} style={{
                    display: "inline-block", padding: "0.4rem 0.8rem", 
                    background: "var(--terracotta)", color: "#fff", 
                    borderRadius: "8px", textDecoration: "none", fontSize: "0.85rem"
                  }}>
                    عرض الملف
                  </a>
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
    </div>
  );
}
