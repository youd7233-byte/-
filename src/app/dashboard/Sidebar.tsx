"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function Sidebar({ role, name }: { role: string; name: string }) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchUnread = async () => {
    try {
      const res = await fetch("/api/messages/unread");
      const data = await res.json();
      setUnreadCount(data.count || 0);
    } catch {}
  };

  useEffect(() => {
    fetchUnread();
    pollingRef.current = setInterval(fetchUnread, 10000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  useEffect(() => {
    if (pathname === "/dashboard/messages") setUnreadCount(0);
  }, [pathname]);

  const links = [
    { name: "الرئيسية", href: "/dashboard", icon: "🏠" },
    { name: "الخريطة", href: "/dashboard/map", icon: "📍" },
    { name: "الرسائل", href: "/dashboard/messages", icon: "💬", badge: unreadCount > 0 ? unreadCount : null },
    ...(role === "ARTISAN"
      ? [{ name: "إحصائيات", href: "/dashboard/stats", icon: "📈", badge: null }]
      : []),
    { name: "الإعدادات", href: "/dashboard/settings", icon: "⚙️", badge: null },
  ];

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="dashboard-sidebar"
        style={{
          width: "240px",
          background: "#0F0A06",
          backdropFilter: "blur(20px)",
          borderLeft: "1px solid rgba(201,168,76,0.12)",
          display: "flex",
          flexDirection: "column",
          padding: "1.5rem 0.85rem",
          gap: "0.35rem",
          flexShrink: 0,
          position: "relative",
        }}
      >
        {/* Subtle gold gradient line top */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "2px",
          background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.5), transparent)",
        }} />

        {/* معلومات المستخدم */}
        <div style={{ padding: "0.85rem 1rem 1.25rem", marginBottom: "0.5rem", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
          <div style={{
            width: "46px",
            height: "46px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #C9A84C 0%, #6B4E1A 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0A0806",
            fontWeight: 900,
            fontSize: "1.1rem",
            marginBottom: "0.6rem",
            boxShadow: "0 4px 16px rgba(201,168,76,0.3)",
          }}>
            {name.charAt(0)}
          </div>
          <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#F0E6C8" }}>
            {name.split(" ")[0]}
          </div>
          <div style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            background: role === "ARTISAN" ? "rgba(201,168,76,0.12)" : "rgba(3,105,161,0.12)",
            color: role === "ARTISAN" ? "#C9A84C" : "#38bdf8",
            padding: "0.2rem 0.65rem",
            borderRadius: "10px",
            display: "inline-block",
            marginTop: "0.3rem",
            border: role === "ARTISAN" ? "1px solid rgba(201,168,76,0.2)" : "1px solid rgba(56,189,248,0.2)",
          }}>
            {role === "ARTISAN" ? "⚒️ حرفي" : "👤 مواطن"}
          </div>
        </div>

        {/* روابط التنقل */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1 }}>
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.78rem 1rem",
                  borderRadius: "12px",
                  textDecoration: "none",
                  fontWeight: active ? 800 : 600,
                  color: active ? "#C9A84C" : "#8A7055",
                  background: active
                    ? "linear-gradient(135deg, rgba(201,168,76,0.14), rgba(201,168,76,0.06))"
                    : "transparent",
                  borderRight: active
                    ? "3px solid #C9A84C"
                    : "3px solid transparent",
                  transition: "all 0.2s",
                  fontSize: "0.9rem",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.07)";
                    (e.currentTarget as HTMLElement).style.color = "#C9A84C";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "#8A7055";
                  }
                }}
              >
                <span style={{ fontSize: "1.1rem", width: "22px", textAlign: "center" }}>
                  {link.icon}
                </span>
                <span style={{ flex: 1 }}>{link.name}</span>
                {link.badge && (
                  <span style={{
                    background: "linear-gradient(135deg, #C9A84C, #8B6B2A)",
                    color: "#0A0806",
                    borderRadius: "999px",
                    fontSize: "0.62rem",
                    fontWeight: 900,
                    padding: "0.15rem 0.5rem",
                    minWidth: "20px",
                    textAlign: "center",
                    animation: "pulse 2s infinite",
                  }}>
                    {link.badge > 99 ? "99+" : link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* تسجيل الخروج */}
        <div style={{ paddingTop: "1rem", borderTop: "1px solid rgba(201,168,76,0.1)" }}>
          <form action="/api/logout" method="POST">
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "12px",
                border: "1px solid rgba(201,168,76,0.15)",
                background: "transparent",
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 700,
                fontSize: "0.88rem",
                cursor: "pointer",
                color: "#6A5538",
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(220,38,38,0.08)";
                (e.currentTarget as HTMLElement).style.color = "#f87171";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(220,38,38,0.2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = "#6A5538";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.15)";
              }}
            >
              <span>🚪</span> تسجيل خروج
            </button>
          </form>
        </div>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .dashboard-sidebar { display: none !important; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.08); }
        }
      `}</style>
    </>
  );
}
