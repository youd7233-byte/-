"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = { email, password };

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
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Tajawal:wght@400;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0D0F14;
          font-family: 'Cairo', 'Tajawal', sans-serif;
          direction: rtl;
          padding: 1.5rem;
        }

        .login-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: 100%;
          max-width: 980px;
          min-height: 580px;
          background: #131820;
          border-radius: 28px;
          overflow: hidden;
          border: 1px solid rgba(217,162,100,0.18);
          box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(217,162,100,0.08);
          animation: fadeUp 0.55s ease both;
        }

        /* ── Left Panel (Hero Image) ── */
        .login-hero {
          position: relative;
          overflow: hidden;
          min-height: 420px;
        }

        .login-hero img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: brightness(0.55);
        }

        .login-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(10,8,6,0.1) 0%,
            rgba(10,8,6,0.3) 40%,
            rgba(10,8,6,0.85) 100%
          );
        }

        .login-hero-top {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .login-hero-logo-icon {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, #D9A264, #A97B3C);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          box-shadow: 0 4px 14px rgba(217,162,100,0.3);
        }

        .login-hero-brand {
          font-family: 'Tajawal', sans-serif;
          font-weight: 900;
          font-size: 1.2rem;
          color: #F0F4F8;
          letter-spacing: 0.01em;
        }

        .login-hero-back {
          position: absolute;
          top: 1.5rem;
          left: 1.5rem;
          background: rgba(10,8,6,0.5);
          border: 1px solid rgba(217,162,100,0.25);
          color: #D9A264;
          font-family: 'Cairo', sans-serif;
          font-weight: 600;
          font-size: 0.82rem;
          padding: 0.45rem 1rem;
          border-radius: 50px;
          cursor: pointer;
          text-decoration: none;
          backdrop-filter: blur(8px);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .login-hero-back:hover {
          background: rgba(217,162,100,0.12);
          border-color: rgba(217,162,100,0.5);
        }

        .login-hero-bottom {
          position: absolute;
          bottom: 2rem;
          right: 1.5rem;
          left: 1.5rem;
        }

        .login-hero-title {
          font-family: 'Tajawal', sans-serif;
          font-weight: 900;
          font-size: 1.6rem;
          color: #F0F4F8;
          line-height: 1.3;
          margin-bottom: 1rem;
        }

        .login-hero-title span {
          color: #D9A264;
        }

        .login-hero-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .login-hero-tag {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(217,162,100,0.12);
          border: 1px solid rgba(217,162,100,0.25);
          border-radius: 50px;
          padding: 0.35rem 0.85rem;
          font-size: 0.78rem;
          font-weight: 600;
          color: #D9A264;
          backdrop-filter: blur(4px);
        }

        /* ── Right Panel (Form) ── */
        .login-form-panel {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 3rem 2.5rem;
          background: #131820;
        }

        .login-form-title {
          font-family: 'Tajawal', sans-serif;
          font-weight: 900;
          font-size: 1.95rem;
          color: #F0F4F8;
          margin-bottom: 0.4rem;
          line-height: 1.2;
        }

        .login-form-title span {
          color: #D9A264;
        }

        .login-form-subtitle {
          font-size: 0.875rem;
          color: #6A7A8A;
          margin-bottom: 2rem;
          font-weight: 500;
        }

        .login-form-subtitle a {
          color: #D9A264;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
        }
        .login-form-subtitle a:hover { text-decoration: underline; }

        .login-error {
          padding: 0.85rem 1rem;
          border-radius: 12px;
          background: rgba(239,68,68,0.08);
          color: #f87171;
          font-size: 0.875rem;
          border: 1px solid rgba(239,68,68,0.2);
          margin-bottom: 1.25rem;
          text-align: center;
        }

        .login-form { display: flex; flex-direction: column; gap: 1rem; }

        .login-input-group { display: flex; flex-direction: column; gap: 0.45rem; }

        .login-label {
          font-size: 0.82rem;
          font-weight: 700;
          color: #A7B8C4;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .login-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .login-input-icon {
          position: absolute;
          right: 1rem;
          color: #6A7A8A;
          font-size: 0.95rem;
          pointer-events: none;
        }

        .login-input {
          width: 100%;
          padding: 0.85rem 2.6rem 0.85rem 1rem;
          background: #171F2A;
          border: 1px solid rgba(217,162,100,0.15);
          border-radius: 12px;
          color: #F0F4F8;
          font-family: 'Cairo', sans-serif;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          direction: ltr;
          text-align: right;
        }
        .login-input[type="email"] { text-align: left; direction: ltr; }
        .login-input::placeholder { color: #6A7A8A; }
        .login-input:focus {
          border-color: rgba(217,162,100,0.45);
          box-shadow: 0 0 0 3px rgba(217,162,100,0.08);
        }

        .login-password-toggle {
          position: absolute;
          left: 1rem;
          background: none;
          border: none;
          color: #6A7A8A;
          cursor: pointer;
          font-size: 0.9rem;
          padding: 0;
          line-height: 1;
          transition: color 0.2s;
        }
        .login-password-toggle:hover { color: #D9A264; }

        .login-btn-primary {
          width: 100%;
          padding: 0.95rem;
          border-radius: 13px;
          background: linear-gradient(135deg, #D9A264 0%, #A97B3C 100%);
          color: #0D0F14;
          font-family: 'Cairo', sans-serif;
          font-weight: 900;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          margin-top: 0.25rem;
          transition: all 0.25s;
          box-shadow: 0 6px 24px rgba(217,162,100,0.2);
          letter-spacing: 0.01em;
        }
        .login-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(217,162,100,0.35);
        }
        .login-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .login-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.25rem 0;
          color: #6A7A8A;
        }
        .login-divider hr {
          flex: 1;
          border: none;
          border-top: 1px solid rgba(217,162,100,0.12);
        }
        .login-divider span { font-size: 0.8rem; font-weight: 600; white-space: nowrap; }

        .login-btn-google {
          width: 100%;
          padding: 0.9rem;
          border-radius: 13px;
          background: #171F2A;
          border: 1px solid rgba(217,162,100,0.18);
          color: #F0F4F8;
          font-family: 'Cairo', sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          text-decoration: none;
          transition: all 0.25s;
        }
        .login-btn-google:hover {
          background: rgba(217,162,100,0.07);
          border-color: rgba(217,162,100,0.35);
          transform: translateY(-1px);
        }

        .login-btn-google img {
          width: 20px;
          height: 20px;
        }

        /* ── Responsive ── */
        @media (max-width: 760px) {
          .login-root { padding: 0; align-items: stretch; }
          .login-card {
            grid-template-columns: 1fr;
            border-radius: 0;
            min-height: 100vh;
            border: none;
            box-shadow: none;
          }
          .login-hero {
            min-height: 220px;
            max-height: 260px;
          }
          .login-hero-title { font-size: 1.2rem; }
          .login-form-panel {
            padding: 2rem 1.5rem;
            flex: 1;
          }
          .login-form-title { font-size: 1.6rem; }
          .login-hero-tags { display: none; }
        }

        @media (max-width: 400px) {
          .login-form-panel { padding: 1.75rem 1.25rem; }
          .login-form-title { font-size: 1.4rem; }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="login-root">
        <div className="login-card">

          {/* ── Hero Panel (Left on desktop, top on mobile) ── */}
          <div className="login-hero">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/artisan-hero.png" alt="حرفيون جزائريون" />
            <div className="login-hero-overlay" />

            {/* Brand */}
            <div className="login-hero-top">
              <div className="login-hero-logo-icon">🔨</div>
              <span className="login-hero-brand">حِرَفي</span>
            </div>

            {/* Back to site */}
            <Link href="/" className="login-hero-back">
              ← العودة للموقع
            </Link>

            {/* Bottom text */}
            <div className="login-hero-bottom">
              <h2 className="login-hero-title">
                ابحث عن أمهر الحرفيين،<br />
                <span>وأنجز مشاريعك بسهولة</span>
              </h2>
              <div className="login-hero-tags">
                <div className="login-hero-tag">🪚 نجارة</div>
                <div className="login-hero-tag">🔧 سباكة</div>
                <div className="login-hero-tag">⚡ كهرباء</div>
                <div className="login-hero-tag">🎨 دهانة</div>
              </div>
            </div>
          </div>

          {/* ── Form Panel ── */}
          <div className="login-form-panel">

            <h1 className="login-form-title">
              {isLogin ? (
                <>مرحباً <span>بك مجدداً</span></>
              ) : (
                <>إنشاء <span>حساب جديد</span></>
              )}
            </h1>

            <p className="login-form-subtitle">
              {isLogin ? (
                <>ليس لديك حساب؟{" "}
                  <a onClick={() => setIsLogin(false)}>سجّل الآن</a>
                </>
              ) : (
                <>لديك حساب بالفعل؟{" "}
                  <a onClick={() => setIsLogin(true)}>تسجيل الدخول</a>
                </>
              )}
            </p>

            {error && <div className="login-error">{error}</div>}

            <form className="login-form" onSubmit={handleSubmit}>
              {/* Email */}
              <div className="login-input-group">
                <label className="login-label">
                  <span>✉</span> البريد الإلكتروني
                </label>
                <div className="login-input-wrap">
                  <span className="login-input-icon">@</span>
                  <input
                    id="login-email"
                    className="login-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="login-input-group">
                <label className="login-label">
                  <span>🔒</span> كلمة المرور
                </label>
                <div className="login-input-wrap">
                  <span className="login-input-icon">🔑</span>
                  <input
                    id="login-password"
                    className="login-input"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    style={{ paddingLeft: "2.8rem" }}
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="إظهار/إخفاء كلمة المرور"
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                className="login-btn-primary"
                disabled={loading}
              >
                {loading
                  ? "جاري المعالجة..."
                  : isLogin
                  ? "تسجيل الدخول"
                  : "إنشاء الحساب"}
              </button>
            </form>

            {/* Divider */}
            <div className="login-divider">
              <hr /><span>أو تابع باستخدام</span><hr />
            </div>

            {/* Google */}
            <a
              id="google-login-btn"
              href="/api/auth/google"
              className="login-btn-google"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
              />
              المتابعة بحساب Google
            </a>
          </div>

        </div>
      </div>
    </>
  );
}
