"use client";

import Navbar from "@/components/Navbar";
import dynamic from "next/dynamic";
import { useState } from "react";

const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

import "leaflet/dist/leaflet.css";

// Sample artisans for demonstration (until DB is populated)
const SAMPLE_ARTISANS = [
  { id: 1, name: "عبد القادر", profession: "نجارة", lat: 36.7538, lng: 3.0588, phone: "0555112233" },
  { id: 2, name: "سمير", profession: "كهرباء", lat: 36.7638, lng: 3.0688, phone: "0666223344" },
  { id: 3, name: "مراد", profession: "سباكة", lat: 36.7438, lng: 3.0488, phone: "0777334455" },
];

export default function SearchPage() {
  const [filter, setFilter] = useState("");

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Navbar />
      
      <main style={{ display: "grid", gridTemplateColumns: "350px 1fr", height: "calc(100vh - 70px)" }}>
        {/* Sidebar Filters */}
        <aside style={{ 
          background: "#fff", 
          padding: "2rem", 
          borderLeft: "1px solid rgba(200,149,108,0.2)",
          overflowY: "auto",
          zIndex: 10
        }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 900, marginBottom: "1.5rem" }}>ابحث عن حرفي</h2>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.5rem" }}>نوع الحرفة</label>
            <select 
              style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "1.5px solid var(--sand)" }}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">كل الحرف</option>
              <option>نجارة</option>
              <option>كهرباء</option>
              <option>سباكة</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {SAMPLE_ARTISANS.filter(a => !filter || a.profession === filter).map(artisan => (
              <div key={artisan.id} style={{ 
                padding: "1rem", 
                borderRadius: "12px", 
                border: "1px solid var(--sand)",
                background: "var(--cream)",
                cursor: "pointer"
              }}>
                <h4 style={{ fontWeight: 800 }}>{artisan.name}</h4>
                <p style={{ fontSize: "0.85rem", color: "var(--terracotta)" }}>{artisan.profession}</p>
                <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
                  <a href={`tel:${artisan.phone}`} style={{ 
                    flex: 1, textAlign: "center", padding: "0.4rem", background: "var(--dark)", color: "#fff", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 700 
                  }}>اتصال</a>
                  <a href={`https://wa.me/${artisan.phone}`} style={{ 
                    flex: 1, textAlign: "center", padding: "0.4rem", background: "#25D366", color: "#fff", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 700 
                  }}>WhatsApp</a>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Map Area */}
        <div style={{ position: "relative" }}>
          <MapContainer center={[36.7538, 3.0588]} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {SAMPLE_ARTISANS.filter(a => !filter || a.profession === filter).map(artisan => (
              <Marker key={artisan.id} position={[artisan.lat, artisan.lng]}>
                <Popup>
                  <div style={{ textAlign: "right" }}>
                    <h4 style={{ margin: 0 }}>{artisan.name}</h4>
                    <p style={{ margin: "5px 0", color: "var(--terracotta)" }}>{artisan.profession}</p>
                    <a href={`tel:${artisan.phone}`} style={{ color: "blue" }}>{artisan.phone}</a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </main>

      <style>{`
        @media (max-width: 900px) {
          main { grid-template-columns: 1fr !important; }
          aside { display: none; }
        }
      `}</style>
    </div>
  );
}
