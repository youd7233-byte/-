"use client";

import { useState, useMemo } from "react";
import DynamicClusterMap from "@/components/DynamicClusterMap";
import type { ArtisanMarker } from "@/components/ClusterMap";
import Link from "next/link";

interface PublicMapClientProps {
  artisans: ArtisanMarker[];
  center: [number, number];
  wilayas: string[];
  professions: string[];
  totalCount: number;
}

export default function PublicMapClient({ artisans, center, wilayas, professions, totalCount }: PublicMapClientProps) {
  const [filterWilaya, setFilterWilaya] = useState("");
  const [filterProfession, setFilterProfession] = useState("");
  const [searchText, setSearchText] = useState("");
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const filtered = useMemo(() => {
    return artisans.filter((a) => {
      if (filterWilaya && a.wilaya !== filterWilaya) return false;
      if (filterProfession && a.profession !== filterProfession) return false;
      if (searchText && !a.name.includes(searchText) && !a.profession.includes(searchText)) return false;
      return true;
    });
  }, [artisans, filterWilaya, filterProfession, searchText]);

  const mapCenter = useMemo(() => {
    if (filterWilaya && filtered.length > 0) {
      const lats = filtered.map((a) => a.lat);
      const lngs = filtered.map((a) => a.lng);
      return [
        lats.reduce((s, v) => s + v, 0) / lats.length,
        lngs.reduce((s, v) => s + v, 0) / lngs.length,
      ] as [number, number];
    }
    return center;
  }, [filterWilaya, filtered, center]);

  return (
    <div dir="rtl" style={{ position: "relative" }}>
      {/* Page Title */}
      <div style={{
        padding: "1.5rem 2rem 1rem",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "1.8rem" }}>🗺️</span>
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--dark)" }}>خريطة الحرفيين</h1>
            <p style={{ color: "var(--muted)", fontWeight: 600, fontSize: "0.9rem" }}>
              اكتشف الحرفيين المتاحين في منطقتك
            </p>
          </div>
        </div>
        <div style={{
          background: "linear-gradient(135deg,#B5531A,#d45e1a)",
          borderRadius: "14px", padding: "0.65rem 1.25rem",
          display: "flex", alignItems: "center", gap: "0.5rem",
          boxShadow: "0 4px 16px rgba(181,83,26,0.3)",
        }}>
          <span style={{ fontSize: "1.2rem" }}>👷</span>
          <div>
            <div style={{ color: "#fff", fontWeight: 900, fontSize: "1.3rem", lineHeight: 1 }}>{totalCount}</div>
            <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.72rem", fontWeight: 700 }}>حرفي نشط</div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="public-map-layout" style={{
        display: "grid",
        gridTemplateColumns: "1fr 300px",
        gap: "1.25rem",
        padding: "0 1.5rem 1.5rem",
        alignItems: "start",
      }}>
        {/* Map */}
        <div style={{
          borderRadius: "20px", overflow: "hidden",
          boxShadow: "0 4px 24px rgba(26,18,8,0.1)",
          border: "1px solid rgba(200,149,108,0.2)",
          height: "calc(100vh - 210px)",
          minHeight: "400px",
          background: "#e5e7eb",
        }}>
          <DynamicClusterMap
            artisans={filtered}
            center={mapCenter}
            zoom={filterWilaya ? 9 : 6}
            height="100%"
          />
        </div>

        {/* Filter Sidebar */}
        <div style={{
          background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)",
          borderRadius: "20px", padding: "1.5rem",
          boxShadow: "0 4px 24px rgba(26,18,8,0.07)",
          border: "1px solid rgba(200,149,108,0.15)",
          display: "flex", flexDirection: "column", gap: "1.1rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.1rem" }}>🔍</span>
            <h2 style={{ fontSize: "1rem", fontWeight: 900, color: "var(--dark)" }}>ابحث عن حرفي</h2>
          </div>

          {/* Search input */}
          <input
            type="text"
            placeholder="ابحث عن خدمة أو حرفي..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              width: "100%", padding: "0.75rem 1rem",
              border: "2px solid rgba(200,149,108,0.2)", borderRadius: "12px",
              fontFamily: "'Cairo', sans-serif", fontSize: "0.9rem",
              background: "rgba(255,255,255,0.7)", outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--terracotta)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(200,149,108,0.2)")}
          />

          {/* Wilaya */}
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--dark)", marginBottom: "0.4rem" }}>
              اختر الولاية
            </label>
            <select
              value={filterWilaya}
              onChange={(e) => setFilterWilaya(e.target.value)}
              style={{
                width: "100%", padding: "0.75rem 1rem",
                border: "2px solid rgba(200,149,108,0.2)", borderRadius: "12px",
                fontFamily: "'Cairo', sans-serif", fontSize: "0.9rem",
                background: "rgba(255,255,255,0.7)", outline: "none", cursor: "pointer",
              }}
            >
              <option value="">كل الولايات</option>
              {wilayas.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>

          {/* Profession */}
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--dark)", marginBottom: "0.4rem" }}>
              نوع الخدمة
            </label>
            <select
              value={filterProfession}
              onChange={(e) => setFilterProfession(e.target.value)}
              style={{
                width: "100%", padding: "0.75rem 1rem",
                border: "2px solid rgba(200,149,108,0.2)", borderRadius: "12px",
                fontFamily: "'Cairo', sans-serif", fontSize: "0.9rem",
                background: "rgba(255,255,255,0.7)", outline: "none", cursor: "pointer",
              }}
            >
              <option value="">كل الخدمات</option>
              {professions.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Search button */}
          <button
            onClick={() => {}}
            style={{
              width: "100%", padding: "0.85rem",
              background: "linear-gradient(135deg, var(--terracotta), #d45e1a)",
              color: "#fff", border: "none", borderRadius: "12px",
              fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: "0.95rem",
              cursor: "pointer", boxShadow: "0 4px 14px rgba(181,83,26,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
            }}
          >
            🔍 بحث ({filtered.length} حرفي)
          </button>

          {/* Reset */}
          {(filterWilaya || filterProfession || searchText) && (
            <button
              onClick={() => { setFilterWilaya(""); setFilterProfession(""); setSearchText(""); }}
              style={{
                width: "100%", padding: "0.6rem",
                border: "1.5px solid rgba(200,149,108,0.3)",
                background: "transparent", borderRadius: "10px",
                fontFamily: "'Cairo', sans-serif", fontWeight: 700,
                fontSize: "0.85rem", cursor: "pointer", color: "var(--mid)",
              }}
            >
              إزالة الفلاتر
            </button>
          )}

          {/* Stats */}
          <div style={{ borderTop: "1px solid rgba(200,149,108,0.15)", paddingTop: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "0.78rem", color: "var(--muted)", fontWeight: 700 }}>حرفيون نشطون الآن</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--terracotta)", lineHeight: 1.1 }}>
                  {filtered.length}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                  حرفي متاح حالياً
                </div>
              </div>
              <span style={{ fontSize: "2.5rem" }}>👷</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Button */}
      <div className="mobile-filter-btn" style={{
        display: "none", position: "fixed", bottom: "80px", left: "50%",
        transform: "translateX(-50%)", zIndex: 999,
      }}>
        <button
          onClick={() => setShowMobileFilter(!showMobileFilter)}
          style={{
            padding: "0.75rem 2rem", background: "var(--terracotta)",
            color: "#fff", border: "none", borderRadius: "25px",
            fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: "0.9rem",
            boxShadow: "0 4px 20px rgba(181,83,26,0.4)", cursor: "pointer",
            display: "flex", alignItems: "center", gap: "0.5rem",
          }}
        >
          🔍 تصفية البحث
        </button>
      </div>

      {/* Mobile Filter Sheet */}
      {showMobileFilter && (
        <div className="mobile-filter-sheet" style={{
          display: "none", position: "fixed", bottom: 0, left: 0, right: 0,
          background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)",
          borderRadius: "24px 24px 0 0", padding: "1.5rem",
          boxShadow: "0 -8px 32px rgba(0,0,0,0.15)",
          zIndex: 1000, animation: "slideUp 0.3s ease",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h3 style={{ fontWeight: 900 }}>تصفية البحث</h3>
            <button onClick={() => setShowMobileFilter(false)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>✕</button>
          </div>
          <select value={filterWilaya} onChange={(e) => { setFilterWilaya(e.target.value); setShowMobileFilter(false); }}
            style={{ width: "100%", padding: "0.75rem", border: "2px solid rgba(200,149,108,0.2)", borderRadius: "12px", fontFamily: "'Cairo',sans-serif", marginBottom: "1rem" }}>
            <option value="">كل الولايات</option>
            {wilayas.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
          <select value={filterProfession} onChange={(e) => { setFilterProfession(e.target.value); setShowMobileFilter(false); }}
            style={{ width: "100%", padding: "0.75rem", border: "2px solid rgba(200,149,108,0.2)", borderRadius: "12px", fontFamily: "'Cairo',sans-serif", marginBottom: "1rem" }}>
            <option value="">كل الخدمات</option>
            {professions.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .public-map-layout {
            grid-template-columns: 1fr !important;
            padding: 0 1rem 1rem !important;
          }
          .public-map-layout > div:last-child {
            display: none;
          }
          .mobile-filter-btn { display: flex !important; }
          .mobile-filter-sheet { display: block !important; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
