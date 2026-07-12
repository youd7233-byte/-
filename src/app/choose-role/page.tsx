"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function ChooseRolePage() {
  const [selected, setSelected] = useState<"CLIENT" | "ARTISAN" | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleConfirm = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch("/api/user/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selected }),
      });
      if (!res.ok) throw new Error("Failed");
      if (selected === "ARTISAN") {
        router.push("/complete-profile");
      } else {
        router.push("/complete-client-profile");
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Navbar />

      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(181,83,26,0.08) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 80% 90%, rgba(212,168,67,0.06) 0%, transparent 60%)",
      }} />

      <main style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        minHeight: "calc(100vh - 70px)", padding: "2rem 1.5rem",
        position: "relative", zIndex: 1,
      }}>
        <div style={{
          textAlign: "center", marginBottom: "3rem",
          animation: "fadeUp 0.5s ease both",
        }}>
          <div style={{
            fontSize: "3.5rem", marginBottom: "1rem",
            filter: "drop-shadow(0 4px 12px rgba(181,83,26,0.2))",
          }}>🏠</div>
          <h1 style={{
            fontSize: "2.2rem", fontWeight: 900, color: "var(--dark)",
            marginBottom: "0.75rem", lineHeight: 1.3,
          }}>
            مرحباً بك في <span style={{ color: "var(--terracotta)" }}>حِرَفي</span>!
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1.1rem", fontWeight: 500 }}>
            أخبرنا من أنت لنُخصّص تجربتك
          </p>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem",
          width: "100%", maxWidth: "600px",
          animation: "fadeUp 0.6s ease 0.1s both",
        }}>
          {/* CLIENT Card */}
          <button
            onClick={() => setSelected("CLIENT")}
            style={{
              padding: "2.5rem 1.5rem",
              borderRadius: "24px",
              border: `3px solid ${selected === "CLIENT" ? "var(--terracotta)" : "rgba(200,149,108,0.2)"}`,
              background: selected === "CLIENT" ? "rgba(181,83,26,0.06)" : "rgba(255,255,255,0.8)",
              backdropFilter: "blur(10px)",
              cursor: "pointer",
              transition: "all 0.25s",
              boxShadow: selected === "CLIENT"
                ? "0 12px 40px rgba(181,83,26,0.2)"
                : "0 4px 20px rgba(0,0,0,0.06)",
              textAlign: "center",
              transform: selected === "CLIENT" ? "translateY(-4px)" : "translateY(0)",
            }}
          >
            <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>👤</div>
            <h2 style={{
              fontSize: "1.4rem", fontWeight: 900,
              color: selected === "CLIENT" ? "var(--terracotta)" : "var(--dark)",
              marginBottom: "0.5rem",
            }}>مواطن</h2>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
              أبحث عن حرفيين موثوقين بالقرب مني
            </p>
            {selected === "CLIENT" && (
              <div style={{
                marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem",
                background: "var(--terracotta)", color: "#fff",
                padding: "0.3rem 1rem", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 700,
              }}>
                ✓ تم الاختيار
              </div>
            )}
          </button>

          {/* ARTISAN Card */}
          <button
            onClick={() => setSelected("ARTISAN")}
            style={{
              padding: "2.5rem 1.5rem",
              borderRadius: "24px",
              border: `3px solid ${selected === "ARTISAN" ? "var(--terracotta)" : "rgba(200,149,108,0.2)"}`,
              background: selected === "ARTISAN" ? "rgba(181,83,26,0.06)" : "rgba(255,255,255,0.8)",
              backdropFilter: "blur(10px)",
              cursor: "pointer",
              transition: "all 0.25s",
              boxShadow: selected === "ARTISAN"
                ? "0 12px 40px rgba(181,83,26,0.2)"
                : "0 4px 20px rgba(0,0,0,0.06)",
              textAlign: "center",
              transform: selected === "ARTISAN" ? "translateY(-4px)" : "translateY(0)",
            }}
          >
            <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>👷</div>
            <h2 style={{
              fontSize: "1.4rem", fontWeight: 900,
              color: selected === "ARTISAN" ? "var(--terracotta)" : "var(--dark)",
              marginBottom: "0.5rem",
            }}>حرفي</h2>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
              أقدّم خدماتي وأريد عملاء جدد
            </p>
            {selected === "ARTISAN" && (
              <div style={{
                marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem",
                background: "var(--terracotta)", color: "#fff",
                padding: "0.3rem 1rem", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 700,
              }}>
                ✓ تم الاختيار
              </div>
            )}
          </button>
        </div>

        {selected && (
          <div style={{
            marginTop: "2.5rem",
            animation: "fadeUp 0.3s ease both",
          }}>
            <button
              onClick={handleConfirm}
              disabled={loading}
              style={{
                padding: "1.1rem 3.5rem",
                borderRadius: "18px",
                background: loading ? "var(--muted)" : "linear-gradient(135deg, var(--terracotta) 0%, #d45e1a 100%)",
                color: "#fff",
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 900,
                fontSize: "1.15rem",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 10px 32px rgba(181,83,26,0.3)",
                transition: "all 0.25s",
                display: "flex", alignItems: "center", gap: "0.75rem",
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    display: "inline-block", width: "18px", height: "18px",
                    border: "3px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff", borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }} />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  {selected === "ARTISAN" ? "ابدأ تسجيل حرفتك ←" : "اكتشف الحرفيين ←"}
                </>
              )}
            </button>
          </div>
        )}
      </main>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
