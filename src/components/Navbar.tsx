"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface NavSession {
  name: string;
  role: string;
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [session, setSession] = useState<NavSession | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Read session status from a lightweight API route
  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.user) setSession(data.user); })
      .catch(() => null);
  }, []);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2.5rem",
        height: "70px",
        background: scrolled
          ? "rgba(251, 246, 236, 0.97)"
          : "rgba(251, 246, 236, 0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: scrolled
          ? "1px solid rgba(200, 149, 108, 0.25)"
          : "1px solid transparent",
        transition: "all 0.3s ease",
        boxShadow: scrolled ? "0 4px 24px rgba(26,18,8,0.07)" : "none",
      }}
      className="navbar-inner"
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          fontFamily: "'Tajawal', sans-serif",
          fontSize: "1.75rem",
          fontWeight: 900,
          color: "var(--terracotta)",
          letterSpacing: "-0.03em",
          display: "flex",
          alignItems: "center",
          gap: "2px",
        }}
      >
        حِرَفي
        <span style={{ color: "var(--gold)", fontSize: "2.1rem", lineHeight: 1 }}>.</span>
      </Link>

      {/* Desktop Nav */}
      <div
        style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
        className="desktop-nav"
      >
        {session ? (
          // Logged-in state
          <>
            <Link
              href="/dashboard"
              style={{
                fontSize: "0.88rem",
                fontWeight: 700,
                color: "var(--mid)",
                padding: "0.45rem 1rem",
                borderRadius: "8px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = "rgba(200,149,108,0.1)";
                (e.target as HTMLElement).style.color = "var(--terracotta)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = "transparent";
                (e.target as HTMLElement).style.color = "var(--mid)";
              }}
            >
              👷 {session.name.split(" ")[0]}
            </Link>
            <form action="/api/logout" method="POST">
              <button
                type="submit"
                style={{
                  fontSize: "0.88rem",
                  fontWeight: 800,
                  color: "var(--mid)",
                  background: "transparent",
                  border: "1.5px solid rgba(200,149,108,0.3)",
                  padding: "0.5rem 1.2rem",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontFamily: "'Cairo', sans-serif",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--terracotta)";
                  (e.currentTarget as HTMLElement).style.color = "var(--terracotta)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,149,108,0.3)";
                  (e.currentTarget as HTMLElement).style.color = "var(--mid)";
                }}
              >
                خروج
              </button>
            </form>
          </>
        ) : (
          // Logged-out state
          <>
            <Link
              href="/register-artisan"
              style={{
                fontSize: "0.88rem",
                fontWeight: 700,
                color: "var(--mid)",
                padding: "0.45rem 1rem",
                borderRadius: "8px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = "rgba(200,149,108,0.1)";
                (e.target as HTMLElement).style.color = "var(--terracotta)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = "transparent";
                (e.target as HTMLElement).style.color = "var(--mid)";
              }}
            >
              سجّل حرفتك
            </Link>
            <Link
              href="/login"
              style={{
                fontSize: "0.88rem",
                fontWeight: 800,
                color: "#fff",
                background: "var(--terracotta)",
                padding: "0.5rem 1.4rem",
                borderRadius: "10px",
                transition: "all 0.2s",
                boxShadow: "0 4px 14px rgba(181,83,26,0.25)",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = "var(--mid)";
                (e.target as HTMLElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = "var(--terracotta)";
                (e.target as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              تسجيل الدخول
            </Link>
          </>
        )}
      </div>

      {/* Mobile Hamburger */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="القائمة"
        aria-expanded={menuOpen}
        style={{
          display: "none",
          flexDirection: "column",
          gap: "5px",
          background: "none",
          border: "none",
          padding: "4px",
          cursor: "pointer",
        }}
        className="hamburger"
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              display: "block",
              width: "22px",
              height: "2px",
              background: "var(--dark)",
              borderRadius: "2px",
              transition: "all 0.3s",
              transformOrigin: "center",
              transform:
                menuOpen
                  ? i === 0 ? "rotate(45deg) translateY(7px)" : i === 2 ? "rotate(-45deg) translateY(-7px)" : "opacity: 0"
                  : "none",
              opacity: menuOpen && i === 1 ? 0 : 1,
            }}
          />
        ))}
      </button>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          position: "absolute",
          top: "70px",
          left: 0,
          right: 0,
          background: "rgba(251, 246, 236, 0.98)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(200,149,108,0.2)",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          boxShadow: "0 12px 32px rgba(26,18,8,0.1)",
          animation: "fadeIn 0.2s ease",
        }} className="mobile-menu">
          {session ? (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} style={{ fontWeight: 700, color: "var(--dark)", padding: "0.75rem 1rem", borderRadius: "10px", background: "var(--sand)" }}>
                👷 لوحة التحكم
              </Link>
              <form action="/api/logout" method="POST">
                <button type="submit" style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "1.5px solid rgba(200,149,108,0.3)", background: "transparent", fontFamily: "'Cairo', sans-serif", fontWeight: 700, color: "var(--mid)", cursor: "pointer" }}>
                  تسجيل الخروج
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/register-artisan" onClick={() => setMenuOpen(false)} style={{ fontWeight: 700, color: "var(--dark)", padding: "0.75rem 1rem", borderRadius: "10px", background: "var(--sand)" }}>
                سجّل حرفتك
              </Link>
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{ fontWeight: 800, color: "#fff", background: "var(--terracotta)", padding: "0.75rem 1rem", borderRadius: "10px", textAlign: "center" }}>
                تسجيل الدخول
              </Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
