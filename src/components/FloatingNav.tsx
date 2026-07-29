"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function FloatingNav({ role }: { role: string }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch unread messages count
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
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  useEffect(() => {
    if (pathname === "/dashboard/messages") {
      setUnreadCount(0);
    }
    // Close menu when route changes
    setIsOpen(false);
  }, [pathname]);

  const links = [
    { name: "الرئيسية", href: "/dashboard", icon: "🏠" },
    { name: "الخريطة", href: "/map", icon: "📍" },
    {
      name: "الرسائل",
      href: "/dashboard/messages",
      icon: "💬",
      badge: unreadCount > 0 ? unreadCount : null,
    },
    ...(role === "ARTISAN"
      ? [{ name: "إحصائيات", href: "/dashboard/stats", icon: "📈", badge: null }]
      : []),
    { name: "الإعدادات", href: "/dashboard/settings", icon: "⚙️", badge: null },
  ];

  return (
    <>
      {/* Overlay to close when clicking outside */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9998,
            background: "rgba(0,0,0,0.1)",
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      <div
        style={{
          position: "fixed",
          bottom: "2rem",
          left: "2rem", // Left side for RTL feels natural for FAB
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "1rem",
        }}
      >
        {/* Menu Items */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            transform: isOpen ? "translateY(0) scale(1)" : "translateY(20px) scale(0.9)",
            opacity: isOpen ? 1 : 0,
            pointerEvents: isOpen ? "auto" : "none",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            transformOrigin: "bottom left",
            alignItems: "flex-start",
          }}
        >
          {links.map((link, index) => {
            const active = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1.25rem",
                  borderRadius: "999px",
                  background: active ? "var(--terracotta)" : "#fff",
                  color: active ? "#fff" : "var(--dark)",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                  transition: "all 0.2s",
                  transform: isOpen ? "translateX(0)" : "translateX(-20px)",
                  transitionDelay: \`\${isOpen ? (links.length - index) * 0.05 : 0}s\`,
                }}
              >
                <span style={{ fontSize: "1.2rem", display: "flex" }}>
                  {link.icon}
                </span>
                <span>{link.name}</span>
                {link.badge && (
                  <span
                    style={{
                      background: active ? "#fff" : "#dc2626",
                      color: active ? "var(--terracotta)" : "#fff",
                      borderRadius: "999px",
                      fontSize: "0.7rem",
                      fontWeight: 900,
                      padding: "0.1rem 0.4rem",
                      marginLeft: "-0.5rem",
                    }}
                  >
                    {link.badge > 99 ? "99+" : link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Main FAB Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "var(--dark)",
            color: "var(--gold)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            cursor: "pointer",
            boxShadow: isOpen ? "0 8px 28px rgba(26,18,8,0.3)" : "0 4px 16px rgba(26,18,8,0.2)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          {isOpen ? "✕" : "🧭"}
        </button>
      </div>

      {/* Global CSS adjustments */}
      <style>{`
        /* Hide mobile bottom nav since we now use FAB */
        .mobile-bottom-nav {
          display: none !important;
        }
      `}</style>
    </>
  );
}
