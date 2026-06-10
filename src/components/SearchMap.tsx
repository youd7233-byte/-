"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix default Leaflet icons
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const PremiumIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface SearchMapProps {
  artisans: any[];
  center: [number, number];
  zoom?: number;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function SearchMap({ artisans, center, zoom = 11 }: SearchMapProps) {
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={center} />
        {artisans.map((artisan) => (
          artisan.lat && artisan.lng && (
            <Marker
              key={artisan.id}
              position={[artisan.lat, artisan.lng]}
              icon={artisan.isPremium ? PremiumIcon : DefaultIcon}
            >
              <Popup>
                <div style={{ textAlign: "right", fontFamily: "'Cairo', sans-serif" }}>
                  <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800 }}>
                    {artisan.name} {artisan.isPremium && "⭐"}
                  </h4>
                  <p style={{ margin: "4px 0", color: "var(--terracotta)", fontSize: "0.8rem", fontWeight: 700 }}>
                    {artisan.profession}
                  </p>
                  {artisan.city && (
                    <p style={{ margin: "2px 0", color: "var(--muted)", fontSize: "0.75rem" }}>
                      📍 {artisan.city}، {artisan.wilaya}
                    </p>
                  )}
                  <div style={{ marginTop: "8px", display: "flex", gap: "4px" }}>
                    <a
                      href={`tel:${artisan.phone}`}
                      style={{
                        padding: "4px 10px",
                        background: "var(--dark)",
                        color: "#fff",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      اتصال
                    </a>
                    <a
                      href={`https://wa.me/${artisan.phone}`}
                      style={{
                        padding: "4px 10px",
                        background: "#25D366",
                        color: "#fff",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      واتساب
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}
