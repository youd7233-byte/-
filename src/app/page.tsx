"use client";

import Navbar from "@/components/Navbar";

export default function Home() {
  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "var(--cream)", color: "var(--text)", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decorative Background */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          background: "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(181,83,26,0.08) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 80% 90%, rgba(212,168,67,0.06) 0%, transparent 60%)",
        }} />

        <div style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          maxWidth: "600px",
          width: "100%",
          animation: "fadeUp 0.6s ease both"
        }}>
          <div style={{
            fontSize: "4rem",
            marginBottom: "1.5rem",
            filter: "drop-shadow(0 4px 12px rgba(181,83,26,0.2))",
          }}>
            🛠️
          </div>
          
          <h1 style={{
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            fontWeight: 900,
            color: "var(--dark)",
            lineHeight: 1.2,
            marginBottom: "1.5rem",
          }}>
            حِرَفي
            <span style={{ color: "var(--terracotta)" }}>.</span>
          </h1>
          
          <p style={{
            fontSize: "1.2rem",
            color: "var(--muted)",
            marginBottom: "3rem",
            lineHeight: 1.6,
            fontWeight: 500
          }}>
            المنصة الأولى لربط الحرفيين المهرة بالعملاء في الجزائر.
            <br />
            تواصل، اتفق، وانجز أعمالك بسهولة.
          </p>

          <button
            onClick={handleGoogleLogin}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
              width: "100%",
              maxWidth: "360px",
              margin: "0 auto",
              padding: "1.1rem 1.5rem",
              borderRadius: "16px",
              background: "#fff",
              border: "1px solid rgba(200,149,108,0.3)",
              boxShadow: "0 12px 32px rgba(26,18,8,0.08)",
              cursor: "pointer",
              transition: "all 0.25s",
              fontSize: "1.1rem",
              fontWeight: 800,
              color: "var(--dark)",
              fontFamily: "'Cairo', sans-serif"
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 40px rgba(181,83,26,0.15)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--terracotta)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(26,18,8,0.08)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,149,108,0.3)";
            }}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
              </g>
            </svg>
            المتابعة باستخدام حساب Google
          </button>
        </div>
      </main>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
