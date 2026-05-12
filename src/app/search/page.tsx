"use client";
import Navbar from "@/components/Navbar";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { getArtisans } from "@/app/actions/artisan";

const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

import "leaflet/dist/leaflet.css";

const PROFESSIONS = [
  "نجارة","كهرباء","سباكة","بناء وتشطيب","دهان","تبليط","لحام وحدادة",
  "خياطة","تصليح سيارات","تبريد وتكييف","أخرى",
];

export default function SearchPage() {
  const [filter, setFilter] = useState("");
  const [artisans, setArtisans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fixIcons = async () => {
      const L = (await import("leaflet")).default;
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    };
    fixIcons();
    fetchData();
  }, [filter]);

  async function fetchData() {
    setLoading(true);
    const result = await getArtisans(filter || undefined);
    if (result.success) {
      setArtisans(result.data || []);
    }
    setLoading(false);
  }

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
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">كل الحرف</option>
              {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {loading ? (
              <p style={{ textAlign: "center", color: "var(--muted)" }}>جاري البحث...</p>
            ) : artisans.length === 0 ? (
              <p style={{ textAlign: "center", color: "var(--muted)" }}>لا يوجد حرفيون في هذا التخصص حالياً</p>
            ) : (
              artisans.map(artisan => (
                <div key={artisan.id} style={{ 
                  padding: "1rem", 
                  borderRadius: "12px", 
                  border: artisan.isPremium ? "2px solid var(--gold)" : "1px solid var(--sand)",
                  background: artisan.isPremium ? "rgba(212,168,67,0.05)" : "var(--cream)",
                  cursor: "pointer",
                  position: "relative"
                }}>
                  {artisan.isPremium && (
                    <span style={{ position: "absolute", top: "10px", left: "10px", fontSize: "0.7rem", background: "var(--gold)", color: "#000", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>مميز</span>
                  )}
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
              ))
            )}
          </div>
        </aside>

        {/* Map Area */}
        <div style={{ position: "relative" }}>
          <MapContainer center={[36.7538, 3.0588]} zoom={11} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {artisans.map(artisan => (
              artisan.lat && artisan.lng && (
                <Marker key={artisan.id} position={[artisan.lat, artisan.lng]}>
                  <Popup>
                    <div style={{ textAlign: "right" }}>
                      <h4 style={{ margin: 0 }}>{artisan.name}</h4>
                      <p style={{ margin: "5px 0", color: "var(--terracotta)" }}>{artisan.profession}</p>
                      <a href={`tel:${artisan.phone}`} style={{ fontWeight: "bold", color: "var(--dark)" }}>{artisan.phone}</a>
                    </div>
                  </Popup>
                </Marker>
              )
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
