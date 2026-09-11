"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import NotificationsBell from "./NotificationsBell";

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
        height: "68px",
        background: scrolled
          ? "rgba(10,8,6,0.97)"
          : "rgba(10,8,6,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: scrolled
          ? "1px solid rgba(217,162,100,0.22)"
          : "1px solid rgba(217,162,100,0.08)",
        transition: "all 0.3s ease",
        boxShadow: scrolled ? "0 4px 32px rgba(0,0,0,0.6)" : "none",
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
          color: "#D9A264",
          letterSpacing: "-0.03em",
          display: "flex",
          alignItems: "center",
          gap: "2px",
          textShadow: "0 0 20px rgba(217,162,100,0.3)",
        }}
      >
        حِرَفي
        <span style={{ color: "#E2BE6E", fontSize: "2.1rem", lineHeight: 1 }}>.</span>
      </Link>

      {/* Desktop Nav */}
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }} className="desktop-nav">
        {session ? (
          <>
            <NotificationsBell />
            <Link
              href="/dashboard"
              style={{
                fontSize: "0.88rem",
                fontWeight: 700,
                color: "#A7B8C4",
                padding: "0.45rem 1rem",
                borderRadius: "8px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = "rgba(217,162,100,0.1)";
                (e.target as HTMLElement).style.color = "#D9A264";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = "transparent";
                (e.target as HTMLElement).style.color = "#A7B8C4";
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
                  color: "#A7B8C4",
                  background: "transparent",
                  border: "1.5px solid rgba(217,162,100,0.25)",
                  padding: "0.5rem 1.2rem",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontFamily: "'Cairo', sans-serif",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "#D9A264";
                  (e.currentTarget as HTMLElement).style.color = "#D9A264";
                  (e.currentTarget as HTMLElement).style.background = "rgba(217,162,100,0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(217,162,100,0.25)";
                  (e.currentTarget as HTMLElement).style.color = "#A7B8C4";
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                خروج
              </button>
            </form>
          </>
        ) : (
          <>
            <Link
              href="/register-artisan"
              style={{
                fontSize: "0.88rem",
                fontWeight: 700,
                color: "#A7B8C4",
                padding: "0.45rem 1rem",
                borderRadius: "8px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = "rgba(217,162,100,0.1)";
                (e.target as HTMLElement).style.color = "#D9A264";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = "transparent";
                (e.target as HTMLElement).style.color = "#A7B8C4";
              }}
            >
              سجّل حرفتك
            </Link>
            <Link
              href="/login"
              style={{
                fontSize: "0.88rem",
                fontWeight: 800,
                color: "#0D0F14",
                background: "linear-gradient(135deg, #D9A264 0%, #A97B3C 100%)",
                padding: "0.5rem 1.4rem",
                borderRadius: "10px",
                transition: "all 0.2s",
                boxShadow: "0 4px 14px rgba(217,162,100,0.25)",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.boxShadow = "0 6px 22px rgba(217,162,100,0.4)";
                (e.target as HTMLElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.boxShadow = "0 4px 14px rgba(217,162,100,0.25)";
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
              background: "#D9A264",
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
          top: "68px",
          left: 0,
          right: 0,
          background: "rgba(10,8,6,0.98)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(217,162,100,0.18)",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
          animation: "fadeIn 0.2s ease",
        }} className="mobile-menu">
          {session ? (
            <>
              <div style={{ alignSelf: "flex-end" }}>
                <NotificationsBell />
              </div>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} style={{ fontWeight: 700, color: "#F0F4F8", padding: "0.75rem 1rem", borderRadius: "10px", background: "rgba(217,162,100,0.1)", border: "1px solid rgba(217,162,100,0.18)" }}>
                👷 لوحة التحكم
              </Link>
              <form action="/api/logout" method="POST">
                <button type="submit" style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "1.5px solid rgba(217,162,100,0.25)", background: "transparent", fontFamily: "'Cairo', sans-serif", fontWeight: 700, color: "#A7B8C4", cursor: "pointer" }}>
                  تسجيل الخروج
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/register-artisan" onClick={() => setMenuOpen(false)} style={{ fontWeight: 700, color: "#F0F4F8", padding: "0.75rem 1rem", borderRadius: "10px", background: "rgba(217,162,100,0.1)", border: "1px solid rgba(217,162,100,0.18)" }}>
                سجّل حرفتك
              </Link>
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{ fontWeight: 800, color: "#0D0F14", background: "linear-gradient(135deg, #D9A264 0%, #A97B3C 100%)", padding: "0.75rem 1rem", borderRadius: "10px", textAlign: "center" }}>
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
