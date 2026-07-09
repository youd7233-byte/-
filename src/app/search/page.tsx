"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

const WILAYAS = [
  "?????","?????","???????","?? ???????","?????","?????","?????","????","???????","???????",
  "???????","????","??????","?????","???? ???","???????","??????","????","????","?????",
  "??????","???? ??????","?????","?????","???????","??????","???????","???????","?????","?????",
  "?????","?????","?????","??? ????????","???????","??????","?????","????????","??????","?????",
  "??? ?????","??????","????","??? ??????","???????","??? ??????","??????","??????",
];

const PROFESSIONS = [
  "????","???????","?????","?????","?????","????????","????","?????","??????","????","????",
];

interface Artisan {
  id: string; userId: string; userName: string; userImage: string | null;
  profession: string; wilaya: string; city: string | null;
  bio: string | null; lat: number | null; lng: number | null;
  isPremium: boolean; isVerified: boolean;
  reviewCount: number; avgRating: number | null;
}

export default function SearchPage() {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [profession, setProfession] = useState("");
  const [wilaya, setWilaya] = useState("");

  const fetchArtisans = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (profession) params.set("profession", profession);
    if (wilaya) params.set("wilaya", wilaya);
    const res = await fetch(`/api/artisans?${params.toString()}`);
    const data = await res.json();
    setArtisans(data.artisans || []);
    setLoading(false);
  }, [search, profession, wilaya]);

  useEffect(() => {
    const t = setTimeout(fetchArtisans, 400);
    return () => clearTimeout(t);
  }, [fetchArtisans]);

  const inputStyle: React.CSSProperties = {
    padding: "0.85rem 1.2rem", border: "2px solid rgba(200,149,108,0.22)",
    borderRadius: "14px", fontSize: "0.95rem", fontFamily: "'Cairo',sans-serif",
    color: "var(--text)", background: "rgba(255,255,255,0.85)",
    outline: "none", transition: "all 0.2s",
  };

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Navbar />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 70% 40% at 5% 10%, rgba(181,83,26,0.06) 0%, transparent 55%)" }} />

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem", position: "relative", zIndex: 1 }}>

        {/* Page Title */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "var(--dark)", marginBottom: "0.4rem" }}>
            ?? ???? ?? ??????
          </h1>
          <p style={{ color: "var(--muted)", fontWeight: 500 }}>???? ??? ???? ???????? ????????? ?????? ???</p>
        </div>

        {/* Filters Bar */}
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto",
          gap: "1rem", marginBottom: "2rem",
          background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)",
          borderRadius: "20px", padding: "1.5rem",
          boxShadow: "0 4px 20px rgba(26,18,8,0.07)",
          border: "1px solid rgba(200,149,108,0.15)",
        }}>
          <input
            type="text" placeholder="?? ???? ?????? ?? ??????..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle }}
          />
          <select value={profession} onChange={(e) => setProfession(e.target.value)} style={{ ...inputStyle }}>
            <option value="">?? ??????</option>
            {PROFESSIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={wilaya} onChange={(e) => setWilaya(e.target.value)} style={{ ...inputStyle }}>
            <option value="">?? ????????</option>
            {WILAYAS.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
          <button onClick={fetchArtisans} style={{
            padding: "0.85rem 1.5rem", borderRadius: "14px",
            background: "linear-gradient(135deg, var(--terracotta), #d45e1a)",
            color: "#fff", fontFamily: "'Cairo',sans-serif", fontWeight: 800,
            border: "none", cursor: "pointer", fontSize: "0.95rem",
            boxShadow: "0 4px 16px rgba(181,83,26,0.28)",
          }}>???</button>
        </div>

        {/* Results Count */}
        <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--muted)" }}>
              <div style={{
                width: "16px", height: "16px", border: "2px solid rgba(181,83,26,0.3)",
                borderTopColor: "var(--terracotta)", borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }} />
              ???? ?????...
            </div>
          ) : (
            <span style={{ color: "var(--muted)", fontWeight: 600, fontSize: "0.95rem" }}>
              {artisans.length === 0 ? "?? ???? ?????" : `${artisans.length} ???? ????`}
            </span>
          )}
        </div>

        {/* Results Grid */}
        {artisans.length === 0 && !loading ? (
          <div style={{
            textAlign: "center", padding: "5rem 2rem",
            background: "rgba(255,255,255,0.7)", borderRadius: "24px",
            border: "2px dashed rgba(200,149,108,0.25)",
          }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>??</div>
            <h2 style={{ fontWeight: 900, color: "var(--dark)", marginBottom: "0.5rem" }}>?? ???? ?????</h2>
            <p style={{ color: "var(--muted)" }}>??? ????? ?????? ?????</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
            {artisans.map((artisan) => (
              <Link
                key={artisan.id}
                href={`/artisan/${artisan.userId}`}
                style={{ textDecoration: "none" }}
              >
                <div style={{
                  background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)",
                  borderRadius: "20px", padding: "1.5rem",
                  boxShadow: "0 4px 20px rgba(26,18,8,0.07)",
                  border: artisan.isPremium ? "2px solid rgba(212,168,67,0.4)" : "1px solid rgba(200,149,108,0.14)",
                  transition: "all 0.25s", cursor: "pointer",
                  position: "relative", overflow: "hidden",
                }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(26,18,8,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(26,18,8,0.07)";
                  }}
                >
                  {artisan.isPremium && (
                    <div style={{
                      position: "absolute", top: "12px", left: "12px",
                      background: "linear-gradient(135deg, #f59e0b, #d97706)",
                      color: "#fff", padding: "0.25rem 0.7rem", borderRadius: "20px",
                      fontSize: "0.75rem", fontWeight: 800,
                    }}>? Premium</div>
                  )}

                  <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                    <div style={{
                      width: "60px", height: "60px", borderRadius: "50%", flexShrink: 0,
                      background: artisan.userImage ? `url(${artisan.userImage}) center/cover` : "linear-gradient(135deg, var(--terracotta), #d45e1a)",
                      boxShadow: "0 4px 14px rgba(181,83,26,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.5rem", color: "#fff",
                    }}>
                      {!artisan.userImage && "??"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.2rem", flexWrap: "wrap" }}>
                        <h3 style={{ fontWeight: 900, color: "var(--dark)", fontSize: "1rem", margin: 0 }}>
                          {artisan.userName}
                        </h3>
                        {artisan.isVerified && <span style={{ color: "#16a34a", fontSize: "0.8rem", fontWeight: 800 }}>?</span>}
                      </div>
                      <p style={{ color: "var(--terracotta)", fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.25rem" }}>
                        {artisan.profession}
                      </p>
                      <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        ?? {artisan.wilaya}{artisan.city ? ` / ${artisan.city}` : ""}
                      </p>
                    </div>
                  </div>

                  {artisan.bio && (
                    <p style={{
                      color: "var(--text)", fontSize: "0.88rem", lineHeight: 1.6,
                      marginTop: "1rem",
                      display: "-webkit-box", WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>{artisan.bio}</p>
                  )}

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "1rem" }}>
                    <div>
                      {artisan.avgRating ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <span style={{ color: "#f59e0b" }}>{"?".repeat(Math.round(artisan.avgRating))}</span>
                          <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--dark)" }}>{artisan.avgRating}</span>
                          <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>({artisan.reviewCount})</span>
                        </div>
                      ) : (
                        <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>?? ??????? ???</span>
                      )}
                    </div>
                    <div style={{
                      padding: "0.4rem 1rem", borderRadius: "10px",
                      background: "rgba(181,83,26,0.08)", color: "var(--terracotta)",
                      fontSize: "0.82rem", fontWeight: 700,
                    }}>??? ????? ?</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        select:focus, input:focus { border-color: var(--terracotta) !important; box-shadow: 0 0 0 4px rgba(181,83,26,0.1) !important; }
        @media (max-width: 768px) {
          .filters-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
