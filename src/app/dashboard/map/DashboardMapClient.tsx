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
  const [showFilters, setShowFilters] = useState(false);
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
    { icon: "👷", label: "الحرفيون النشطون", value: stats.totalArtisans.toLocaleString("ar-DZ"), color: "#B5531A", sub: "+٢٣٪ من الشهر الماضي" },
    { icon: "📍", label: "المناطق المغطاة", value: `${stats.activeWilayas}`, color: "#0369a1", sub: "ولاية" },
    { icon: "⭐", label: "التقييمات", value: `${stats.overallRating}`, color: "#D4A843", sub: "من 5" },
    { icon: "📋", label: "إجمالي التقييمات", value: stats.totalReviews.toLocaleString("ar-DZ"), color: "#7c3aed", sub: "+١٨٪ من الشهر الماضي" },
  ];

  return (
    <div className="map-dashboard-wrapper" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      
      {/* Header */}
      <div style={{
        background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)",
        borderRadius: "20px", padding: "1.5rem 2rem",
        boxShadow: "0 4px 24px rgba(26,18,8,0.07)",
        border: "1px solid rgba(200,149,108,0.15)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "2rem" }}>🗺️</span>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--dark)", marginBottom: "0.2rem" }}>
              خريطة الحرفيين
            </h1>
            <p style={{ color: "var(--muted)", fontWeight: 600, fontSize: "0.88rem" }}>
              استكشف الحرفيين المتاحين في منطقتك
            </p>
          </div>
        </div>
        <div style={{
          background: "linear-gradient(135deg, #B5531A, #d45e1a)",
          borderRadius: "14px", padding: "0.75rem 1.5rem",
          display: "flex", alignItems: "center", gap: "0.75rem",
          boxShadow: "0 4px 16px rgba(181,83,26,0.3)",
        }}>
          <span style={{ fontSize: "1.4rem" }}>👷</span>
          <div>
            <div style={{ color: "#fff", fontWeight: 900, fontSize: "1.6rem", lineHeight: 1 }}>
              {stats.totalArtisans}
            </div>
            <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.78rem", fontWeight: 700 }}>
              حرفي نشط الآن
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="map-stats-grid" style={{
        display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem",
      }}>
        {statCards.map((card) => (
          <div key={card.label} style={{
            background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
            borderRadius: "16px", padding: "1.25rem 1rem",
            boxShadow: "0 4px 20px rgba(26,18,8,0.06)",
            border: "1px solid rgba(200,149,108,0.12)",
            display: "flex", alignItems: "center", gap: "0.75rem",
          }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: `${card.color}18`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.3rem", flexShrink: 0,
            }}>{card.icon}</div>
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 900, color: card.color, lineHeight: 1.1 }}>
                {card.value}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 700 }}>{card.label}</div>
              {card.sub && <div style={{ fontSize: "0.7rem", color: "#16a34a", fontWeight: 700, marginTop: "2px" }}>{card.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Map + Filter layout */}
      <div className="map-main-layout" style={{
        display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.25rem", alignItems: "start",
      }}>
        {/* Map */}
        <div style={{
          background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
          borderRadius: "20px", overflow: "hidden",
          boxShadow: "0 4px 24px rgba(26,18,8,0.07)",
          border: "1px solid rgba(200,149,108,0.15)",
          height: "500px",
        }}>
          <DynamicClusterMap
            artisans={filtered}
            center={mapCenter}
            zoom={filterWilaya ? 9 : 6}
            height="500px"
            onArtisanClick={setSelectedArtisan}
          />
        </div>

        {/* Filter Panel */}
        <div style={{
          background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)",
          borderRadius: "20px", padding: "1.5rem",
          boxShadow: "0 4px 24px rgba(26,18,8,0.07)",
          border: "1px solid rgba(200,149,108,0.15)",
          display: "flex", flexDirection: "column", gap: "1.25rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.2rem" }}>🔍</span>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 900, color: "var(--dark)" }}>تصفية البحث</h2>
          </div>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="ابحث عن حرفي..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                width: "100%", padding: "0.8rem 1rem 0.8rem 2.5rem",
                border: "2px solid rgba(200,149,108,0.2)", borderRadius: "12px",
                fontFamily: "'Cairo', sans-serif", fontSize: "0.9rem",
                background: "rgba(255,255,255,0.7)", outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--terracotta)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(200,149,108,0.2)")}
            />
            <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", fontSize: "1rem" }}>🔍</span>
          </div>

          {/* Wilaya */}
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--dark)", marginBottom: "0.5rem" }}>
              اختر الولاية
            </label>
            <select
              value={filterWilaya}
              onChange={(e) => setFilterWilaya(e.target.value)}
              style={{
                width: "100%", padding: "0.8rem 1rem",
                border: "2px solid rgba(200,149,108,0.2)", borderRadius: "12px",
                fontFamily: "'Cairo', sans-serif", fontSize: "0.9rem",
                background: "rgba(255,255,255,0.7)", outline: "none", cursor: "pointer",
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
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--dark)", marginBottom: "0.5rem" }}>
              نوع الخدمة
            </label>
            <select
              value={filterProfession}
              onChange={(e) => setFilterProfession(e.target.value)}
              style={{
                width: "100%", padding: "0.8rem 1rem",
                border: "2px solid rgba(200,149,108,0.2)", borderRadius: "12px",
                fontFamily: "'Cairo', sans-serif", fontSize: "0.9rem",
                background: "rgba(255,255,255,0.7)", outline: "none", cursor: "pointer",
              }}
            >
              <option value="">كل الخدمات</option>
              {professions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Apply / Reset */}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={() => { setFilterWilaya(""); setFilterProfession(""); setSearchText(""); }}
              style={{
                flex: 1, padding: "0.75rem", borderRadius: "10px",
                border: "2px solid rgba(200,149,108,0.3)",
                background: "transparent", fontFamily: "'Cairo', sans-serif",
                fontWeight: 700, fontSize: "0.88rem", cursor: "pointer",
                color: "var(--mid)",
              }}
            >
              إعادة ضبط
            </button>
            <button
              style={{
                flex: 2, padding: "0.75rem", borderRadius: "10px",
                background: "linear-gradient(135deg, var(--terracotta), #d45e1a)",
                border: "none", fontFamily: "'Cairo', sans-serif",
                fontWeight: 800, fontSize: "0.9rem", cursor: "pointer",
                color: "#fff", boxShadow: "0 4px 14px rgba(181,83,26,0.3)",
              }}
            >
              🔍 تطبيق الفلاتر ({filtered.length})
            </button>
          </div>

          {/* Artisan count per wilaya */}
          {filterWilaya && (
            <div style={{
              background: "rgba(181,83,26,0.06)", borderRadius: "12px", padding: "0.75rem 1rem",
              border: "1px solid rgba(181,83,26,0.12)",
            }}>
              <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--terracotta)" }}>
                📍 {filterWilaya}
              </div>
              <div style={{ fontWeight: 900, fontSize: "1.4rem", color: "var(--dark)" }}>
                {filtered.length} حرفي
              </div>
            </div>
          )}

          {/* Density legend */}
          <div style={{ fontSize: "0.78rem", color: "var(--muted)", borderTop: "1px solid rgba(200,149,108,0.15)", paddingTop: "1rem" }}>
            <div style={{ fontWeight: 800, marginBottom: "0.5rem", color: "var(--dark)" }}>دليل الألوان:</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {[
                { color: "#B5531A", label: "عالي الكثافة (10+)" },
                { color: "#D4A843", label: "متوسط (5-9)" },
                { color: "#22c55e", label: "منخفض (1-4)" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Artisans */}
      <div style={{
        background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
        borderRadius: "20px", padding: "1.75rem",
        boxShadow: "0 4px 24px rgba(26,18,8,0.07)",
        border: "1px solid rgba(200,149,108,0.15)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 900, color: "var(--dark)" }}>
              🏆 اكتشف أفضل الحرفيين
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 600 }}>
              تقييمات عالية من عملاء سابقين
            </p>
          </div>
          <Link href="/search" style={{
            fontSize: "0.85rem", fontWeight: 700, color: "var(--terracotta)",
            padding: "0.5rem 1rem", borderRadius: "10px",
            border: "1px solid rgba(181,83,26,0.25)",
          }}>
            عرض الكل ←
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
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "1rem", borderRadius: "14px",
                background: i === 0 ? "rgba(212,168,67,0.08)" : "rgba(181,83,26,0.04)",
                border: `1px solid ${i === 0 ? "rgba(212,168,67,0.25)" : "rgba(200,149,108,0.12)"}`,
                textDecoration: "none", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
            >
              <div style={{
                width: "48px", height: "48px", borderRadius: "50%",
                background: "linear-gradient(135deg, var(--terracotta), #d45e1a)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 900, fontSize: "1.1rem", flexShrink: 0,
                position: "relative",
              }}>
                {artisan.name.charAt(0)}
                {i === 0 && (
                  <span style={{
                    position: "absolute", top: "-4px", right: "-4px",
                    fontSize: "0.7rem", background: "#D4A843", borderRadius: "50%",
                    width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>🥇</span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--dark)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {artisan.name}
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--terracotta)", fontWeight: 700 }}>
                  {artisan.profession}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#D4A843", fontWeight: 700 }}>
                  {"★".repeat(Math.round(artisan.avgRating || 0))} {artisan.avgRating?.toFixed(1)}
                </div>
              </div>
            </Link>
          ))}
          {topArtisans.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "2rem", color: "var(--muted)" }}>
              لا يوجد حرفيون بتقييمات بعد
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom spacing */}
      <div className="mobile-bottom-spacer" style={{ height: "70px", display: "none" }} />

      <style>{`
        @media (max-width: 900px) {
          .map-stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .map-main-layout { grid-template-columns: 1fr !important; }
          .top-artisans-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 600px) {
          .map-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .top-artisans-grid { grid-template-columns: 1fr 1fr !important; }
          .map-dashboard-wrapper { gap: 0.85rem !important; }
        }
        @media (max-width: 480px) {
          .map-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .top-artisans-grid { grid-template-columns: 1fr !important; }
          .mobile-bottom-spacer { display: block !important; }
        }
      `}</style>
    </div>
  );
}
