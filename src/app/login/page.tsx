"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Navbar />

      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 70% 50% at 15% 20%, rgba(181,83,26,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 45% at 85% 80%, rgba(212,168,67,0.06) 0%, transparent 60%)",
      }} />

      <main style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "calc(100vh - 70px)", padding: "2rem 1.5rem",
        position: "relative", zIndex: 1,
      }}>
        <div
          className="auth-card"
          style={{
            width: "100%", maxWidth: "460px",
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            padding: "3rem",
            borderRadius: "32px",
            boxShadow: "0 24px 80px rgba(26,18,8,0.12)",
            border: "1px solid rgba(200,149,108,0.2)",
            animation: "fadeUp 0.5s ease both",
          }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div style={{
              width: "72px", height: "72px",
              background: "linear-gradient(135deg, var(--terracotta) 0%, var(--mid) 100%)",
              borderRadius: "22px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2rem",
              margin: "0 auto 1.25rem",
              boxShadow: "0 12px 32px rgba(181,83,26,0.3)",
            }}>
              🔑
            </div>
            <h1 style={{
              fontSize: "1.85rem", fontWeight: 900, color: "var(--dark)",
              marginBottom: "0.5rem",
            }}>
              مرحباً بك مجدداً
            </h1>
            <p style={{ color: "var(--muted)", fontWeight: 500, fontSize: "0.95rem" }}>
              سجل دخولك بحساب Google للمتابعة
            </p>
          </div>

          <a
            href="/api/auth/google"
            id="google-login-btn"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem",
              width: "100%", padding: "1.1rem", borderRadius: "18px",
              background: "#fff", color: "#333", fontWeight: 800, fontSize: "1.05rem",
              textDecoration: "none", border: "2px solid rgba(0,0,0,0.08)",
              boxShadow: "0 6px 20px rgba(0,0,0,0.08)", transition: "all 0.25s",
              marginBottom: "2rem",
              boxSizing: "border-box",
            }}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: "26px", height: "26px" }} />
            تسجيل الدخول بحساب Google
          </a>

          <div style={{ textAlign: "center" }}>
            <p style={{ color: "var(--muted)", fontWeight: 600, marginBottom: "0.75rem", fontSize: "0.9rem" }}>
              ليس لديك حساب بعد؟
            </p>
            <Link
              href="/register-artisan"
              style={{
                display: "inline-block",
                padding: "0.85rem 2.5rem",
                borderRadius: "14px",
                border: "2px solid rgba(181,83,26,0.25)",
                color: "var(--terracotta)",
                fontWeight: 800,
                fontSize: "0.95rem",
                transition: "all 0.22s",
                background: "transparent",
              }}
            >
              سجل كحرفي الآن
            </Link>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
