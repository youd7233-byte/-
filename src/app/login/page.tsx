"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin ? { email, password } : { name, email, password };
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "حدث خطأ ما");
      }
      
      router.push(data.redirect || "/");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
              {isLogin ? "مرحباً بك مجدداً" : "إنشاء حساب جديد"}
            </h1>
            <p style={{ color: "var(--muted)", fontWeight: 500, fontSize: "0.95rem" }}>
              {isLogin ? "سجل دخولك للمتابعة" : "أدخل بياناتك للانضمام إلى منصة حرفي"}
            </p>
          </div>

          {error && (
            <div style={{
              padding: "1rem", borderRadius: "12px", background: "rgba(239,68,68,0.1)",
              color: "#b91c1c", marginBottom: "1.5rem", fontSize: "0.9rem", textAlign: "center",
              border: "1px solid rgba(239,68,68,0.2)"
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
            {!isLogin && (
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 700, color: "var(--dark)" }}>
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: محمد بن علي"
                  required
                  style={{
                    width: "100%", padding: "0.85rem 1rem", borderRadius: "12px",
                    border: "1px solid rgba(200,149,108,0.3)", outline: "none",
                    fontFamily: "inherit", fontSize: "1rem", boxSizing: "border-box"
                  }}
                />
              </div>
            )}
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 700, color: "var(--dark)" }}>
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                required
                style={{
                  width: "100%", padding: "0.85rem 1rem", borderRadius: "12px",
                  border: "1px solid rgba(200,149,108,0.3)", outline: "none",
                  fontFamily: "inherit", fontSize: "1rem", boxSizing: "border-box"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 700, color: "var(--dark)" }}>
                كلمة المرور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: "100%", padding: "0.85rem 1rem", borderRadius: "12px",
                  border: "1px solid rgba(200,149,108,0.3)", outline: "none",
                  fontFamily: "inherit", fontSize: "1rem", boxSizing: "border-box"
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "1rem", borderRadius: "14px",
                background: "var(--terracotta)", color: "#fff", fontWeight: 800,
                fontSize: "1rem", border: "none", cursor: loading ? "not-allowed" : "pointer",
                marginTop: "0.5rem", opacity: loading ? 0.7 : 1, transition: "opacity 0.2s"
              }}
            >
              {loading ? "جاري المعالجة..." : (isLogin ? "تسجيل الدخول" : "إنشاء حساب")}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1.5rem 0", color: "var(--muted)" }}>
            <hr style={{ flex: 1, border: "none", borderTop: "1px solid rgba(200,149,108,0.2)" }} />
            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>أو</span>
            <hr style={{ flex: 1, border: "none", borderTop: "1px solid rgba(200,149,108,0.2)" }} />
          </div>

          <a
            href="/api/auth/google"
            id="google-login-btn"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem",
              width: "100%", padding: "1rem", borderRadius: "14px",
              background: "#fff", color: "#333", fontWeight: 800, fontSize: "1rem",
              textDecoration: "none", border: "2px solid rgba(0,0,0,0.08)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)", transition: "all 0.25s",
              marginBottom: "1.5rem", boxSizing: "border-box",
            }}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: "24px", height: "24px" }} />
            المتابعة باستخدام Google
          </a>

          <div style={{ textAlign: "center" }}>
            <p style={{ color: "var(--muted)", fontWeight: 600, marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              {isLogin ? "ليس لديك حساب بعد؟" : "لديك حساب بالفعل؟"}
            </p>
            <button
              onClick={() => setIsLogin(!isLogin)}
              style={{
                background: "none", border: "none", color: "var(--terracotta)",
                fontWeight: 800, fontSize: "0.95rem", cursor: "pointer",
                padding: "0.5rem 1rem", textDecoration: "underline"
              }}
            >
              {isLogin ? "سجل الآن" : "تسجيل الدخول"}
            </button>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
