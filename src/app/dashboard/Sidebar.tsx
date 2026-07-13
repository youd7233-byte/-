"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ role, name }: { role: string; name: string }) {
  const pathname = usePathname();

  const links = [
    { name: "الرئيسية", href: "/dashboard", icon: "🏠" },
    { name: "الخريطة", href: "/dashboard/map", icon: "📍" },
    { name: "الرسائل", href: "/dashboard/messages", icon: "💬" },
    ...(role === "ARTISAN" ? [
      { name: "إحصائيات", href: "/dashboard/stats", icon: "📈" },
    ] : []),
    { name: "الإعدادات", href: "/dashboard/settings", icon: "⚙️" },
  ];

  const isActive = (href: string) => pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="dashboard-sidebar"
        style={{
          width: "240px",
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(20px)",
          borderLeft: "1px solid rgba(200,149,108,0.15)",
          display: "flex",
          flexDirection: "column",
          padding: "1.5rem 0.85rem",
          gap: "0.35rem",
          flexShrink: 0,
        }}
      >
        {/* User Info */}
        <div style={{
          padding: "0.85rem 1rem 1.25rem",
          marginBottom: "0.5rem",
          borderBottom: "1px solid rgba(200,149,108,0.12)",
        }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "50%",
            background: "linear-gradient(135deg, var(--terracotta), #d45e1a)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 900, fontSize: "1.1rem",
            marginBottom: "0.6rem",
            boxShadow: "0 4px 12px rgba(181,83,26,0.25)",
          }}>
            {name.charAt(0)}
          </div>
          <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--dark)" }}>
            {name.split(" ")[0]}
          </div>
          <div style={{
            fontSize: "0.75rem", color: "var(--muted)", fontWeight: 700,
            background: role === "ARTISAN" ? "rgba(181,83,26,0.1)" : "rgba(3,105,161,0.1)",
            color: role === "ARTISAN" ? "var(--terracotta)" : "#0369a1",
            padding: "0.2rem 0.6rem", borderRadius: "10px",
            display: "inline-block", marginTop: "0.25rem",
          }}>
            {role === "ARTISAN" ? "حرفي" : "مواطن"}
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.35rem", flex: 1 }}>
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  padding: "0.8rem 1rem",
                  borderRadius: "12px",
                  textDecoration: "none",
                  fontWeight: active ? 800 : 600,
                  color: active ? "var(--terracotta)" : "var(--dark)",
                  background: active
                    ? "linear-gradient(135deg, rgba(181,83,26,0.12), rgba(181,83,26,0.06))"
                    : "transparent",
                  borderRight: active ? "3px solid var(--terracotta)" : "3px solid transparent",
                  transition: "all 0.2s",
                  fontSize: "0.92rem",
                }}
              >
                <span style={{ fontSize: "1.15rem", width: "22px", textAlign: "center" }}>{link.icon}</span>
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ paddingTop: "1rem", borderTop: "1px solid rgba(200,149,108,0.12)" }}>
          <form action="/api/logout" method="POST">
            <button
              type="submit"
              style={{
                width: "100%", padding: "0.75rem 1rem",
                borderRadius: "12px", border: "1.5px solid rgba(200,149,108,0.25)",
                background: "transparent", fontFamily: "'Cairo', sans-serif",
                fontWeight: 700, fontSize: "0.88rem", cursor: "pointer",
                color: "var(--muted)", display: "flex", alignItems: "center", gap: "0.6rem",
                transition: "all 0.2s",
              }}
            >
              <span>🚪</span> تسجيل خروج
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav" style={{
        display: "none",
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(200,149,108,0.2)",
        boxShadow: "0 -4px 24px rgba(26,18,8,0.08)",
        zIndex: 500,
        padding: "0.5rem 0 env(safe-area-inset-bottom, 0.5rem)",
      }}>
        <div style={{
          display: "flex", justifyContent: "space-around", alignItems: "center",
          maxWidth: "500px", margin: "0 auto",
        }}>
          {links.slice(0, 5).map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: "0.2rem", padding: "0.4rem 0.75rem",
                  textDecoration: "none", borderRadius: "12px",
                  transition: "all 0.2s", minWidth: "52px",
                  color: active ? "var(--terracotta)" : "var(--muted)",
                }}
              >
                <span style={{
                  fontSize: "1.4rem",
                  background: active ? "rgba(181,83,26,0.1)" : "transparent",
                  borderRadius: "10px", padding: "0.25rem 0.5rem",
                  display: "block", transition: "all 0.2s",
                }}>{link.icon}</span>
                <span style={{ fontSize: "0.65rem", fontWeight: active ? 800 : 600 }}>
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .dashboard-sidebar { display: none !important; }
          .mobile-bottom-nav { display: block !important; }
        }
      `}</style>
    </>
  );
}
