"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

export default function NotificationsBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id?: string) => {
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Mark all as read when opening dropdown
      markAsRead();
    }
  };

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button
        onClick={handleOpen}
        style={{
          background: "rgba(217,162,100,0.1)",
          border: "none",
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.2rem",
          cursor: "pointer",
          position: "relative",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(217,162,100,0.2)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(217,162,100,0.1)")}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              background: "#dc2626",
              color: "#fff",
              fontSize: "0.65rem",
              fontWeight: 800,
              padding: "0.15rem 0.4rem",
              borderRadius: "99px",
              boxShadow: "0 2px 8px rgba(220,38,38,0.4)",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "120%",
            left: 0, // Aligned to left since it's RTL (left edge matches button's left edge or we can use right)
            width: "320px",
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            border: "1px solid rgba(217,162,100,0.15)",
            overflow: "hidden",
            zIndex: 1000,
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div
            style={{
              padding: "1rem",
              borderBottom: "1px solid rgba(217,162,100,0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "var(--cream)",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "1rem", color: "var(--dark)", fontWeight: 800 }}>الإشعارات</h3>
          </div>

          <div style={{ maxHeight: "350px", overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "2rem 1rem", textAlign: "center", color: "var(--muted)", fontSize: "0.9rem" }}>
                لا توجد إشعارات حالياً
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  style={{
                    padding: "1rem",
                    borderBottom: "1px solid rgba(217,162,100,0.08)",
                    background: notif.isRead ? "#fff" : "rgba(217,162,100,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                    <div style={{ fontWeight: notif.isRead ? 600 : 800, fontSize: "0.9rem", color: "var(--dark)" }}>
                      {notif.title}
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "var(--muted)", whiteSpace: "nowrap" }}>
                      {new Date(notif.createdAt).toLocaleDateString("ar-DZ")}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.5 }}>
                    {notif.content}
                  </div>
                  {notif.link && (
                    <Link
                      href={notif.link}
                      onClick={() => setIsOpen(false)}
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--terracotta)",
                        fontWeight: 700,
                        textDecoration: "none",
                        marginTop: "0.25rem",
                        display: "inline-block",
                      }}
                    >
                      عرض التفاصيل ←
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
