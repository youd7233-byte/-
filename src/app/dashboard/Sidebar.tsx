"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ role, name }: { role: string, name: string }) {
  const pathname = usePathname();

  const links = [
    { name: "الرئيسية", href: "/dashboard", icon: "🏠" },
    ...(role === "ARTISAN" ? [{ name: "إحصائيات", href: "/dashboard/stats", icon: "📈" }] : []),
    { name: "الخريطة", href: "/dashboard/map", icon: "📍" },
    { name: "الرسائل", href: "/dashboard/messages", icon: "💬" },
    { name: "الإعدادات", href: "/dashboard/settings", icon: "⚙️" },
  ];

  return (
    <aside style={{
      width: "260px",
      background: "rgba(255,255,255,0.7)",
      backdropFilter: "blur(20px)",
      borderLeft: "1px solid rgba(200,149,108,0.2)",
      display: "flex",
      flexDirection: "column",
      padding: "2rem 1rem",
    }}>
      <div style={{ marginBottom: "2rem", padding: "0 1rem" }}>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          لوحة التحكم
        </p>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--dark)" }}>
          مرحباً، {name.split(" ")[0]}
        </h2>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.85rem 1rem",
                borderRadius: "12px",
                textDecoration: "none",
                fontWeight: isActive ? 800 : 600,
                color: isActive ? "var(--terracotta)" : "var(--dark)",
                background: isActive ? "rgba(181,83,26,0.1)" : "transparent",
                transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>{link.icon}</span>
              {link.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
