"use client";

import { useState, useMemo } from "react";
import DynamicClusterMap from "@/components/DynamicClusterMap";
import type { ArtisanMarker } from "@/components/ClusterMap";
import Link from "next/link";

interface Stats {
  totalArtisans: number;
  activeWilayas: number;
  overallRating: number;
  totalReviews: number;
}

interface DashboardMapClientProps {
  artisans: ArtisanMarker[];
  center: [number, number];
  stats: Stats;
  topArtisans: ArtisanMarker[];
  wilayas: string[];
  professions: string[];
}

export default function DashboardMapClient({
  artisans,
  center,
  stats,
  topArtisans,
  wilayas,
  professions,
}: DashboardMapClientProps) {
  const [filterWilaya, setFilterWilaya] = useState("");
  const [filterProfession, setFilterProfession] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedArtisan, setSelectedArtisan] = useState<ArtisanMarker | null>(null);

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

  const statCards = [
    { icon: "👷", label: "الحرفيون النشطون", value: stats.totalArtisans.toLocaleString("ar-DZ"), color: "#D9A264", sub: "موزعون على الولايات" },
    { icon: "📍", label: "المناطق المغطاة", value: `${stats.activeWilayas}`, color: "#38bdf8", sub: "ولاية عبر الوطن" },
    { icon: "⭐", label: "التقييمات", value: `${stats.overallRating}`, color: "#facc15", sub: "من 5 نقاط" },
    { icon: "📋", label: "إجمالي التقييمات", value: stats.totalReviews.toLocaleString("ar-DZ"), color: "#a855f7", sub: "مراجعة معتمدة" },
  ];

  return (
    <div className="map-dashboard-wrapper" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      
      {/* Header Banner */}
      <div style={{
        background: "#131820",
        borderRadius: "24px", padding: "1.5rem 2rem",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        border: "1px solid rgba(217,162,100,0.18)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "2rem" }}>🗺️</span>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#F0F4F8", marginBottom: "0.2rem" }}>
              خريطة الحرفيين التفصيلية
            </h1>
            <p style={{ color: "#A7B8C4", fontWeight: 600, fontSize: "0.88rem" }}>
              استكشف أماكن الحرفيين المتاحين وتواصل معهم مباشرة
            </p>
          </div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #D9A264, #A97B3C)",
          borderRadius: "16px", padding: "0.75rem 1.5rem",
          display: "flex", alignItems: "center", gap: "0.75rem",
          boxShadow: "0 4px 20px rgba(217,162,100,0.25)",
        }}>
          <span style={{ fontSize: "1.4rem" }}>👷</span>
          <div>
            <div style={{ color: "#0D0F14", fontWeight: 900, fontSize: "1.6rem", lineHeight: 1 }}>
              {filtered.length}
            </div>
            <div style={{ color: "rgba(13,15,20,0.8)", fontSize: "0.78rem", fontWeight: 800 }}>
              حرفي نشط بالخريطة
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="map-stats-grid" style={{
        display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem",
      }}>
        {statCards.map((card) => (
          <div key={card.label} style={{
            background: "#131820",
            borderRadius: "20px", padding: "1.25rem 1.1rem",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            border: "1px solid rgba(217,162,100,0.14)",
            display: "flex", alignItems: "center", gap: "0.85rem",
          }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "14px",
              background: `${card.color}15`,
              border: `1px solid ${card.color}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.4rem", flexShrink: 0,
            }}>{card.icon}</div>
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 900, color: card.color, lineHeight: 1.1 }}>
                {card.value}
              </div>
              <div style={{ fontSize: "0.78rem", color: "#F0F4F8", fontWeight: 800 }}>{card.label}</div>
              {card.sub && <div style={{ fontSize: "0.7rem", color: "#A7B8C4", fontWeight: 600, marginTop: "2px" }}>{card.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Map + Side Filters */}
      <div className="map-main-layout" style={{
        display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.25rem", alignItems: "stretch",
      }}>
        {/* BIG MAP */}
        <div style={{
          background: "#131820",
          borderRadius: "24px", overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          border: "1px solid rgba(217,162,100,0.18)",
          height: "560px",
        }}>
          <DynamicClusterMap
            artisans={filtered}
            center={mapCenter}
            zoom={filterWilaya ? 9 : 6}
            height="560px"
            onArtisanClick={setSelectedArtisan}
          />
        </div>

        {/* Filter Box */}
        <div style={{
          background: "#131820",
          borderRadius: "24px", padding: "1.5rem",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          border: "1px solid rgba(217,162,100,0.18)",
          display: "flex", flexDirection: "column", gap: "1.25rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.2rem" }}>🔍</span>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 900, color: "#F0F4F8" }}>تصفية الخريطة</h2>
          </div>

          {/* Search */}
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#A7B8C4", marginBottom: "0.4rem" }}>
              اسم الحرفي أو الخدمة
            </label>
            <input
              type="text"
              placeholder="مثال: محمد، سباك..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                width: "100%", padding: "0.8rem 1rem",
                border: "1px solid rgba(217,162,100,0.2)", borderRadius: "14px",
                fontFamily: "'Cairo', sans-serif", fontSize: "0.9rem",
                background: "#0D0F14", color: "#F0F4F8", outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#D9A264")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(217,162,100,0.2)")}
            />
          </div>

          {/* Wilaya */}
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#A7B8C4", marginBottom: "0.4rem" }}>
              الولاية
            </label>
            <select
              value={filterWilaya}
              onChange={(e) => setFilterWilaya(e.target.value)}
              style={{
                width: "100%", padding: "0.8rem 1rem",
                border: "1px solid rgba(217,162,100,0.2)", borderRadius: "14px",
                fontFamily: "'Cairo', sans-serif", fontSize: "0.9rem",
                background: "#0D0F14", color: "#F0F4F8", outline: "none", cursor: "pointer",
              }}
            >
              <option value="">كل الولايات</option>
              {wilayas.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

          {/* Profession */}
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#A7B8C4", marginBottom: "0.4rem" }}>
              المهنة
            </label>
            <select
              value={filterProfession}
              onChange={(e) => setFilterProfession(e.target.value)}
              style={{
                width: "100%", padding: "0.8rem 1rem",
                border: "1px solid rgba(217,162,100,0.2)", borderRadius: "14px",
                fontFamily: "'Cairo', sans-serif", fontSize: "0.9rem",
                background: "#0D0F14", color: "#F0F4F8", outline: "none", cursor: "pointer",
              }}
            >
              <option value="">كل المهن</option>
              {professions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          {(filterWilaya || filterProfession || searchText) && (
            <button
              onClick={() => { setFilterWilaya(""); setFilterProfession(""); setSearchText(""); }}
              style={{
                width: "100%", padding: "0.75rem", borderRadius: "12px",
                border: "1px solid rgba(217,162,100,0.3)",
                background: "transparent", fontFamily: "'Cairo', sans-serif",
                fontWeight: 800, fontSize: "0.88rem", cursor: "pointer",
                color: "#D9A264", transition: "all 0.2s",
              }}
            >
              إعادة ضبط الفلاتر
            </button>
          )}

          {/* Legend */}
          <div style={{ fontSize: "0.8rem", color: "#A7B8C4", borderTop: "1px solid rgba(217,162,100,0.12)", paddingTop: "1rem", marginTop: "auto" }}>
            <div style={{ fontWeight: 800, marginBottom: "0.5rem", color: "#F0F4F8" }}>دليل توزيع الحرفيين:</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {[
                { color: "#D9A264", label: "كثافة عالية (10+ حرفي)" },
                { color: "#38bdf8", label: "كثافة متوسطة (5-9 حرفيين)" },
                { color: "#22c55e", label: "متاح (1-4 حرفيين)" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Artisans Section */}
      <div style={{
        background: "#131820",
        borderRadius: "24px", padding: "1.75rem",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        border: "1px solid rgba(217,162,100,0.18)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#F0F4F8" }}>
              🏆 أفضل الحرفيين المعتمدين
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#A7B8C4", fontWeight: 600 }}>
              الحرفيون الأعلى تقييماً من طرف العملاء
            </p>
          </div>
          <Link href="/search" style={{
            fontSize: "0.85rem", fontWeight: 800, color: "#D9A264",
            padding: "0.5rem 1rem", borderRadius: "12px",
            border: "1px solid rgba(217,162,100,0.25)",
            background: "rgba(217,162,100,0.06)",
          }}>
            تصفح جميع الحرفيين ←
          </Link>
        </div>

        <div className="top-artisans-grid" style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem",
        }}>
          {topArtisans.map((artisan, i) => (
            <Link
              key={artisan.id}
              href={`/artisan/${artisan.userId}`}
              style={{
                display: "flex", alignItems: "center", gap: "0.85rem",
                padding: "1rem 1.1rem", borderRadius: "18px",
                background: i === 0 ? "linear-gradient(135deg, rgba(217,162,100,0.15), rgba(217,162,100,0.05))" : "#0D0F14",
                border: `1px solid ${i === 0 ? "rgba(217,162,100,0.35)" : "rgba(217,162,100,0.12)"}`,
                textDecoration: "none", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
            >
              <div style={{
                width: "48px", height: "48px", borderRadius: "50%",
                background: "linear-gradient(135deg, #D9A264, #8B5E2A)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#0D0F14", fontWeight: 900, fontSize: "1.15rem", flexShrink: 0,
                position: "relative",
              }}>
                {artisan.name.charAt(0)}
                {i === 0 && (
                  <span style={{
                    position: "absolute", top: "-4px", right: "-4px",
                    fontSize: "0.75rem", background: "#facc15", borderRadius: "50%",
                    width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>🥇</span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#F0F4F8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {artisan.name}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#D9A264", fontWeight: 700 }}>
                  {artisan.profession} • {artisan.wilaya}
                </div>
                <div style={{ fontSize: "0.78rem", color: "#facc15", fontWeight: 800, marginTop: "2px" }}>
                  {"★".repeat(Math.round(artisan.avgRating || 0))} {artisan.avgRating?.toFixed(1)}
                </div>
              </div>
            </Link>
          ))}
          {topArtisans.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "2rem", color: "#6A7A8A" }}>
              لا يوجد حرفيون بتقييمات بعد
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .map-stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .map-main-layout { grid-template-columns: 1fr !important; }
          .top-artisans-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
