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
    <div dir="rtl" style={{ position: "relative", minHeight: "calc(100vh - 80px)", background: "#0D0F14", paddingBottom: "1.5rem" }}>
      {/* Top Banner Header */}
      <div
        style={{
          padding: "1.25rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          background: "#131820",
          borderBottom: "1px solid rgba(217,162,100,0.15)",
          marginBottom: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <span style={{ fontSize: "2rem" }}>🗺️</span>
          <div>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#F0F4F8" }}>خريطة الحرفيين المباشرة</h1>
            <p style={{ color: "#A7B8C4", fontWeight: 600, fontSize: "0.85rem" }}>
              اكتشف وتواصل مع أمهر الحرفيين في ولايتك بسهولة
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #D9A264, #A97B3C)",
              borderRadius: "16px",
              padding: "0.6rem 1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.65rem",
              boxShadow: "0 4px 20px rgba(217,162,100,0.25)",
            }}
          >
            <span style={{ fontSize: "1.3rem" }}>👷</span>
            <div>
              <div style={{ color: "#0D0F14", fontWeight: 900, fontSize: "1.4rem", lineHeight: 1 }}>
                {filtered.length}
              </div>
              <div style={{ color: "rgba(13,15,20,0.8)", fontSize: "0.72rem", fontWeight: 800 }}>
                حرفي متاح الآن
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div
        className="public-map-layout"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: "1.25rem",
          padding: "0 1.5rem",
          alignItems: "stretch",
        }}
      >
        {/* BIG MAP CONTAINER */}
        <div
          style={{
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            border: "1px solid rgba(217,162,100,0.18)",
            height: "calc(100vh - 210px)",
            minHeight: "520px",
            background: "#131820",
            position: "relative",
          }}
        >
          <DynamicClusterMap
            artisans={filtered}
            center={mapCenter}
            zoom={filterWilaya ? 9 : 6}
            height="100%"
          />
        </div>

        {/* Filters Panel Desktop */}
        <div
          style={{
            background: "#131820",
            borderRadius: "24px",
            padding: "1.5rem",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            border: "1px solid rgba(217,162,100,0.18)",
            display: "flex",
            flexDirection: "column",
            gap: "1.2rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.2rem" }}>🔍</span>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 900, color: "#F0F4F8" }}>فلترة الحرفيين</h2>
          </div>

          {/* Search Input */}
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#A7B8C4", marginBottom: "0.4rem" }}>
              بحث بالاسم أو الخدمة
            </label>
            <input
              type="text"
              placeholder="مثال: كهربائي، حداد..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                border: "1px solid rgba(217,162,100,0.2)",
                borderRadius: "14px",
                fontFamily: "'Cairo', sans-serif",
                fontSize: "0.9rem",
                background: "#0D0F14",
                color: "#F0F4F8",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#D9A264")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(217,162,100,0.2)")}
            />
          </div>

          {/* Select Wilaya */}
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#A7B8C4", marginBottom: "0.4rem" }}>
              الولاية
            </label>
            <select
              value={filterWilaya}
              onChange={(e) => setFilterWilaya(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                border: "1px solid rgba(217,162,100,0.2)",
                borderRadius: "14px",
                fontFamily: "'Cairo', sans-serif",
                fontSize: "0.9rem",
                background: "#0D0F14",
                color: "#F0F4F8",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="">جميع الولايات ({wilayas.length})</option>
              {wilayas.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

          {/* Select Profession */}
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#A7B8C4", marginBottom: "0.4rem" }}>
              نوع المهنة
            </label>
            <select
              value={filterProfession}
              onChange={(e) => setFilterProfession(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                border: "1px solid rgba(217,162,100,0.2)",
                borderRadius: "14px",
                fontFamily: "'Cairo', sans-serif",
                fontSize: "0.9rem",
                background: "#0D0F14",
                color: "#F0F4F8",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="">جميع المهن ({professions.length})</option>
              {professions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Clear button */}
          {(filterWilaya || filterProfession || searchText) && (
            <button
              onClick={() => {
                setFilterWilaya("");
                setFilterProfession("");
                setSearchText("");
              }}
              style={{
                width: "100%",
                padding: "0.65rem",
                border: "1px solid rgba(217,162,100,0.3)",
                background: "transparent",
                borderRadius: "12px",
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 800,
                fontSize: "0.85rem",
                cursor: "pointer",
                color: "#D9A264",
                transition: "all 0.2s",
              }}
            >
              إلغاء الفلاتر
            </button>
          )}

          {/* Summary Box */}
          <div style={{ borderTop: "1px solid rgba(217,162,100,0.12)", paddingTop: "1rem", marginTop: "auto" }}>
            <div style={{ background: "rgba(217,162,100,0.06)", padding: "1rem", borderRadius: "16px", border: "1px solid rgba(217,162,100,0.15)" }}>
              <div style={{ fontSize: "0.78rem", color: "#A7B8C4", fontWeight: 700 }}>نتائج التصفية</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#D9A264", lineHeight: 1.1 }}>
                {filtered.length} <span style={{ fontSize: "0.9rem", color: "#F0F4F8", fontWeight: 700 }}>حرفي</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Mobile Filter Trigger Button */}
      <div
        className="mobile-filter-btn"
        style={{
          display: "none",
          position: "fixed",
          bottom: "85px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 999,
        }}
      >
        <button
          onClick={() => setShowMobileFilter(true)}
          style={{
            padding: "0.85rem 2rem",
            background: "linear-gradient(135deg, #D9A264, #A97B3C)",
            color: "#0D0F14",
            border: "none",
            borderRadius: "30px",
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 900,
            fontSize: "0.95rem",
            boxShadow: "0 6px 24px rgba(217,162,100,0.4)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          🔍 تصفية النتائج ({filtered.length})
        </button>
      </div>

      {/* Mobile Bottom Sheet Modal */}
      {showMobileFilter && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "flex-end",
          }}
          onClick={() => setShowMobileFilter(false)}
        >
          <div
            style={{
              width: "100%",
              background: "#131820",
              borderRadius: "28px 28px 0 0",
              padding: "1.75rem 1.5rem",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.6)",
              border: "1px solid rgba(217,162,100,0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontWeight: 900, color: "#F0F4F8", fontSize: "1.1rem" }}>🔍 تصفية الحرفيين</h3>
              <button
                onClick={() => setShowMobileFilter(false)}
                style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#F0F4F8", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", fontWeight: 900 }}
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              placeholder="بحث بالاسم..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "100%", padding: "0.8rem", borderRadius: "14px", border: "1px solid rgba(217,162,100,0.2)", background: "#0D0F14", color: "#F0F4F8" }}
            />

            <select
              value={filterWilaya}
              onChange={(e) => setFilterWilaya(e.target.value)}
              style={{ width: "100%", padding: "0.8rem", borderRadius: "14px", border: "1px solid rgba(217,162,100,0.2)", background: "#0D0F14", color: "#F0F4F8" }}
            >
              <option value="">جميع الولايات</option>
              {wilayas.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>

            <select
              value={filterProfession}
              onChange={(e) => setFilterProfession(e.target.value)}
              style={{ width: "100%", padding: "0.8rem", borderRadius: "14px", border: "1px solid rgba(217,162,100,0.2)", background: "#0D0F14", color: "#F0F4F8" }}
            >
              <option value="">جميع المهن</option>
              {professions.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>

            <button
              onClick={() => setShowMobileFilter(false)}
              style={{
                width: "100%",
                padding: "0.9rem",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #D9A264, #A97B3C)",
                color: "#0D0F14",
                border: "none",
                fontWeight: 900,
                fontSize: "1rem",
                cursor: "pointer",
                marginTop: "0.5rem",
              }}
            >
              عرض النتائج ({filtered.length})
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .public-map-layout {
            grid-template-columns: 1fr !important;
            padding: 0 1rem !important;
          }
          .public-map-layout > div:last-child {
            display: none !important;
          }
          .mobile-filter-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
