"use client";

import Navbar from "@/components/Navbar";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { getArtisans } from "@/app/actions/artisan";

const SearchMap = dynamic(() => import("@/components/SearchMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "100%",
        width: "100%",
        background: "var(--sand)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--muted)",
        direction: "rtl",
        fontFamily: "'Cairo', sans-serif",
      }}
    >
      جاري تحميل الخريطة...
    </div>
  ),
});

const PROFESSIONS = [
  "نجارة",
  "كهرباء",
  "سباكة",
  "بناء وتشطيب",
  "دهان",
  "تبليط",
  "لحام وحدادة",
  "خياطة",
  "تصليح سيارات",
  "تبريد وتكييف",
  "أخرى",
];

const WILAYAS = [
  "أدرار",
  "الشلف",
  "الأغواط",
  "أم البواقي",
  "باتنة",
  "بجاية",
  "بسكرة",
  "بشار",
  "البليدة",
  "البويرة",
  "تمنراست",
  "تبسة",
  "تلمسان",
  "تيارت",
  "تيزي وزو",
  "الجزائر العاصمة",
  "الجلفة",
  "جيجل",
  "سطيف",
  "سعيدة",
  "سكيكدة",
  "سيدي بلعباس",
  "عنابة",
  "قالمة",
  "قسنطينة",
  "المدية",
  "مستغانم",
  "المسيلة",
  "معسكر",
  "ورقلة",
  "وهران",
];

const WILAYA_COORDINATES: Record<string, [number, number]> = {
  "الجزائر العاصمة": [36.7538, 3.0588],
  "وهران": [35.6971, -0.6308],
  "قسنطينة": [36.3650, 6.6147],
  "عنابة": [36.9000, 7.7667],
  "البليدة": [36.4700, 2.8300],
  "سطيف": [36.1900, 5.4133],
  "باتنة": [35.5550, 6.1740],
  "تلمسان": [34.8783, -1.3150],
  "بجاية": [36.7558, 5.0843],
  "الشلف": [36.1648, 1.3313],
  "بسكرة": [34.8500, 5.7333],
  "ورقلة": [31.9500, 5.3333],
  "سيدي بلعباس": [35.1900, -0.6300],
  "تيزي وزو": [36.7119, 4.0458],
  "البويرة": [36.3749, 3.9020],
  "المدية": [36.2642, 2.7539],
  "مستغانم": [35.9333, 0.0833],
  "المسيلة": [35.7000, 4.5400],
  "معسكر": [35.4000, 0.1333],
  "جيجل": [36.8000, 5.7667],
  "قالمة": [36.4621, 7.4292],
  "تبسة": [35.4000, 8.1167],
  "أدرار": [27.8700, -0.2900],
  "الأغواط": [33.8000, 2.8667],
  "أم البواقي": [35.8754, 7.1135],
  "بشار": [31.6167, -2.2167],
  "تمنراست": [22.7833, 5.5250],
  "تيارت": [35.3711, 1.3169],
  "سعيدة": [34.8303, 0.1517],
  "سكيكدة": [36.8792, 6.9017],
};

const ALGIERS_COORDINATES: [number, number] = [36.7538, 3.0588];

const SkeletonCard = () => (
  <div
    style={{
      padding: "1.2rem",
      borderRadius: "16px",
      border: "1px solid rgba(200, 149, 108, 0.15)",
      background: "#fff",
      display: "flex",
      flexDirection: "column",
      gap: "0.6rem",
      boxShadow: "var(--shadow-sm)",
    }}
  >
    <div className="shimmer" style={{ height: "20px", width: "70%", borderRadius: "6px" }} />
    <div className="shimmer" style={{ height: "14px", width: "45%", borderRadius: "4px" }} />
    <div className="shimmer" style={{ height: "12px", width: "30%", borderRadius: "4px", marginTop: "4px" }} />
    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.8rem" }}>
      <div className="shimmer" style={{ height: "34px", flex: 1, borderRadius: "8px" }} />
      <div className="shimmer" style={{ height: "34px", flex: 1, borderRadius: "8px" }} />
    </div>
  </div>
);

export default function SearchPage() {
  const [professionFilter, setProfessionFilter] = useState("");
  const [wilayaFilter, setWilayaFilter] = useState("");
  const [artisans, setArtisans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>(ALGIERS_COORDINATES);

  useEffect(() => {
    fetchData();
  }, [professionFilter, wilayaFilter]);

  // When wilaya filter changes, update the map center coordinates
  useEffect(() => {
    if (wilayaFilter && WILAYA_COORDINATES[wilayaFilter]) {
      setMapCenter(WILAYA_COORDINATES[wilayaFilter]);
    } else {
      setMapCenter(ALGIERS_COORDINATES);
    }
  }, [wilayaFilter]);

  async function fetchData() {
    setLoading(true);
    const result = await getArtisans(
      professionFilter || undefined,
      wilayaFilter || undefined
    );
    if (result.success) {
      setArtisans(result.data || []);
    }
    setLoading(false);
  }

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main
        style={{
          display: "grid",
          gridTemplateColumns: "380px 1fr",
          height: "calc(100vh - 70px)",
          overflow: "hidden",
        }}
        className="search-main-layout"
      >
        {/* Sidebar Filters */}
        <aside
          className="search-sidebar"
          style={{
            background: "#fff",
            padding: "2rem",
            borderLeft: "1px solid rgba(200, 149, 108, 0.15)",
            overflowY: "auto",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            boxShadow: "2px 0 10px rgba(0,0,0,0.02)",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "1.6rem",
                fontWeight: 900,
                color: "var(--dark)",
                fontFamily: "'Tajawal', sans-serif",
                marginBottom: "0.25rem",
              }}
            >
              ابحث عن حِرَفي
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
              ابحث وتواصل مع أفضل الحرفيين القريبين منك
            </p>
          </div>

          {/* Profession Selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--mid)" }}>
              نوع الحِرفة
            </label>
            <select
              style={{
                width: "100%",
                padding: "0.8rem 1rem",
                borderRadius: "12px",
                border: "1.5px solid rgba(200,149,108,0.25)",
                background: "var(--cream)",
                fontSize: "0.9rem",
                color: "var(--dark)",
                fontWeight: 600,
                outline: "none",
                transition: "all 0.2s",
              }}
              value={professionFilter}
              onChange={(e) => setProfessionFilter(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "var(--terracotta)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(200,149,108,0.25)")}
            >
              <option value="">كل الحرف والمِهن</option>
              {PROFESSIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Wilaya Selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "0.5rem" }}>
            <label style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--mid)" }}>
              الولاية
            </label>
            <select
              style={{
                width: "100%",
                padding: "0.8rem 1rem",
                borderRadius: "12px",
                border: "1.5px solid rgba(200,149,108,0.25)",
                background: "var(--cream)",
                fontSize: "0.9rem",
                color: "var(--dark)",
                fontWeight: 600,
                outline: "none",
                transition: "all 0.2s",
              }}
              value={wilayaFilter}
              onChange={(e) => setWilayaFilter(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "var(--terracotta)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(200,149,108,0.25)")}
            >
              <option value="">كل الولايات</option>
              {WILAYAS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              height: "1px",
              background: "rgba(200, 149, 108, 0.15)",
              margin: "0.2rem 0",
            }}
          />

          {/* Artisan list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", flex: 1 }}>
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : artisans.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem 1rem",
                  color: "var(--muted)",
                  background: "rgba(200, 149, 108, 0.05)",
                  borderRadius: "16px",
                  border: "1px dashed rgba(200, 149, 108, 0.25)",
                }}
              >
                <span style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }}>🔍</span>
                <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--dark)" }}>لا يوجد حرفيون</p>
                <p style={{ fontSize: "0.8rem", marginTop: "0.2rem" }}>
                  لم نعثر على حرفيين يطابقون هذه الفلاتر حالياً.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--muted)" }}>
                  تم العثور على {artisans.length} حرفي
                </p>
                {artisans.map((artisan) => (
                  <div
                    key={artisan.id}
                    style={{
                      padding: "1.2rem",
                      borderRadius: "16px",
                      border: artisan.isPremium
                        ? "2px solid var(--gold)"
                        : "1px solid rgba(200, 149, 108, 0.2)",
                      background: artisan.isPremium
                        ? "linear-gradient(135deg, rgba(251,246,236,1) 0%, rgba(212,168,67,0.05) 100%)"
                        : "#fff",
                      cursor: "pointer",
                      position: "relative",
                      transition: "all 0.2s ease",
                      boxShadow: artisan.isPremium
                        ? "0 6px 20px rgba(212,168,67,0.1)"
                        : "var(--shadow-sm)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "var(--shadow-md)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = artisan.isPremium
                        ? "0 6px 20px rgba(212,168,67,0.1)"
                        : "var(--shadow-sm)";
                    }}
                  >
                    {artisan.isPremium && (
                      <span
                        style={{
                          position: "absolute",
                          top: "12px",
                          left: "12px",
                          fontSize: "0.68rem",
                          background: "var(--gold)",
                          color: "var(--dark)",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontWeight: 900,
                          boxShadow: "0 2px 8px rgba(212,168,67,0.3)",
                        }}
                      >
                        ⭐ مميز
                      </span>
                    )}

                    <h4 style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--dark)", display: "flex", alignItems: "center", gap: "6px" }}>
                      {artisan.name}
                      {artisan.isVerified && (
                        <span style={{ fontSize: "0.85rem", color: "#1DA1F2" }} title="حساب موثق">
                          🛡️
                        </span>
                      )}
                    </h4>

                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "0.3rem" }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--terracotta)",
                          background: "rgba(181,83,26,0.08)",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          fontWeight: 800,
                        }}
                      >
                        {artisan.profession}
                      </span>
                      {artisan.city && (
                        <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                          📍 {artisan.city}
                        </span>
                      )}
                    </div>

                    {artisan.bio && (
                      <p
                        style={{
                          fontSize: "0.82rem",
                          color: "var(--muted)",
                          marginTop: "0.6rem",
                          whiteSpace: "pre-line",
                          lineHeight: "1.4",
                          maxHeight: "3rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {artisan.bio}
                      </p>
                    )}

                    <div className="artisan-contact-btns" style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
                      <a
                        href={`tel:${artisan.phone}`}
                        style={{
                          flex: 1,
                          textAlign: "center",
                          padding: "0.55rem",
                          background: "var(--dark)",
                          color: "#fff",
                          borderRadius: "8px",
                          fontSize: "0.8rem",
                          fontWeight: 800,
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--terracotta)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--dark)")}
                      >
                        اتصال
                      </a>
                      <a
                        href={`https://wa.me/${artisan.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1,
                          textAlign: "center",
                          padding: "0.55rem",
                          background: "#25D366",
                          color: "#fff",
                          borderRadius: "8px",
                          fontSize: "0.8rem",
                          fontWeight: 800,
                          transition: "opacity 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                      >
                        واتساب
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Map Area */}
        <div className="search-map-wrapper" style={{ position: "relative", height: "100%", width: "100%" }}>
          <SearchMap artisans={artisans} center={mapCenter} />
        </div>
      </main>


    </div>
  );
}
