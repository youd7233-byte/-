"use client";

import { useActionState } from "react";
import { loginArtisan } from "@/app/actions/artisan";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginArtisan, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Navbar />

      {/* Background decorations */}
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
            width: "100%", maxWidth: "480px",
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            padding: "3rem 3rem",
            borderRadius: "32px",
            boxShadow: "0 24px 80px rgba(26,18,8,0.12)",
            border: "1px solid rgba(200,149,108,0.2)",
            animation: "fadeUp 0.5s ease both",
          }}>
          {/* Logo / Header */}
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
              سجل دخولك لمتابعة أعمالك وطلباتك
            </p>
          </div>

          {/* Error Banner */}
          {state?.success === false && (
            <div
              role="alert"
              style={{
                background: "rgba(220,38,38,0.08)",
                border: "1px solid rgba(220,38,38,0.2)",
                borderRadius: "14px",
                padding: "1rem 1.25rem",
                color: "#c53030",
                fontSize: "0.9rem",
                fontWeight: 700,
                marginBottom: "1.5rem",
                textAlign: "center",
              }}
            >
              ⚠️ {state.error}
            </div>
          )}

          <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Phone */}
            <div>
              <label
                htmlFor="login-phone"
                style={{ display: "block", fontSize: "0.88rem", fontWeight: 800, color: "var(--dark)", marginBottom: "0.6rem" }}
              >
                رقم الهاتف
              </label>
              <input
                id="login-phone"
                name="phone"
                type="tel"
                placeholder="0555 000 000"
                dir="ltr"
                required
                autoComplete="tel"
                inputMode="tel"
                style={{
                  width: "100%",
                  padding: "1rem 1.25rem",
                  border: "2px solid rgba(200,149,108,0.2)",
                  borderRadius: "16px",
                  fontSize: "1rem",
                  fontFamily: "'Cairo', sans-serif",
                  color: "var(--text)",
                  background: "rgba(255,255,255,0.7)",
                  outline: "none",
                  transition: "all 0.25s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--terracotta)";
                  e.target.style.boxShadow = "0 0 0 5px rgba(181,83,26,0.08)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(200,149,108,0.2)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                style={{ display: "block", fontSize: "0.88rem", fontWeight: 800, color: "var(--dark)", marginBottom: "0.6rem" }}
              >
                كلمة المرور
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{
                    width: "100%",
                    padding: "1rem 1.25rem",
                    paddingLeft: "3.5rem",
                    border: "2px solid rgba(200,149,108,0.2)",
                    borderRadius: "16px",
                    fontSize: "1rem",
                    fontFamily: "'Cairo', sans-serif",
                    color: "var(--text)",
                    background: "rgba(255,255,255,0.7)",
                    outline: "none",
                    transition: "all 0.25s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--terracotta)";
                    e.target.style.boxShadow = "0 0 0 5px rgba(181,83,26,0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(200,149,108,0.2)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: "absolute", left: "1rem", top: "50%",
                    transform: "translateY(-50%)", background: "none",
                    border: "none", color: "var(--muted)", cursor: "pointer",
                    fontSize: "1.1rem", padding: "2px",
                  }}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              <div style={{ textAlign: "left", marginTop: "0.5rem" }}>
                <a
                  href="#"
                  style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--terracotta)", textDecoration: "none" }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.textDecoration = "underline")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.textDecoration = "none")}
                >
                  نسيت كلمة المرور؟
                </a>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={isPending}
              aria-busy={isPending}
              style={{
                width: "100%",
                padding: "1.1rem",
                borderRadius: "18px",
                background: "linear-gradient(135deg, var(--terracotta) 0%, #d45e1a 100%)",
                color: "#fff",
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 900,
                fontSize: "1.1rem",
                border: "none",
                cursor: isPending ? "not-allowed" : "pointer",
                opacity: isPending ? 0.7 : 1,
                transition: "all 0.25s",
                boxShadow: "0 10px 32px rgba(181,83,26,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
              }}
              onMouseEnter={(e) => {
                if (!isPending) {
                  (e.currentTarget as HTMLElement).style.background = "var(--dark)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 15px 40px rgba(26,18,8,0.25)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, var(--terracotta) 0%, #d45e1a 100%)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 32px rgba(181,83,26,0.3)";
              }}
            >
              {isPending ? (
                <>
                  <span style={{
                    display: "inline-block", width: "18px", height: "18px",
                    border: "3px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff", borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }} />
                  جاري التحقق...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: "flex", alignItems: "center", gap: "1rem",
            margin: "1.75rem 0",
          }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(200,149,108,0.2)" }} />
            <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 600 }}>أو</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(200,149,108,0.2)" }} />
          </div>

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
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(181,83,26,0.06)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--terracotta)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(181,83,26,0.25)";
              }}
            >
              سجل كحرفي الآن
            </Link>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
