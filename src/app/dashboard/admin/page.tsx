"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface ArtisanProfile {
  id: string;
  profession: string;
  wilaya: string;
  city?: string;
  isVerified: boolean;
  isPremium: boolean;
}

interface UserItem {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  createdAt: string;
  artisanProfile?: ArtisanProfile;
}

interface ReviewItem {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  client: { id: string; name: string; email?: string };
  artisanProfile: { user: { id: string; name: string } };
}

interface Stats {
  totalUsers: number;
  totalArtisans: number;
  totalClients: number;
  verifiedArtisans: number;
  premiumArtisans: number;
  totalReviews: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"artisans" | "users" | "reviews">("artisans");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchAdminData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setUsers(data.users);
        setReviews(data.reviews);
      } else {
        setMsg({ type: "error", text: data.error || "تعذر جلب بيانات الإدارة" });
      }
    } catch (err) {
      console.error(err);
      setMsg({ type: "error", text: "حدث خطأ أثناء الاتصال بالسيرفر" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Activate Admin Status for current user
  const handleMakeMeAdmin = async () => {
    setActionLoading("me");
    try {
      const res = await fetch("/api/admin/make-me-admin", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: "success", text: "تم منحك صلاحيات الآدمن الكامـلة! 👑" });
        fetchAdminData();
      } else {
        setMsg({ type: "error", text: data.error || "تعذر تفعيل الصلاحية" });
      }
    } catch {
      setMsg({ type: "error", text: "حدث خطأ أثناء الترقية" });
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle Verify or Premium
  const handleToggle = async (userId: string, action: "toggleVerify" | "togglePremium") => {
    setActionLoading(`${action}-${userId}`);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: "success", text: data.message });
        fetchAdminData();
      } else {
        setMsg({ type: "error", text: data.error || "فشل التحديث" });
      }
    } catch {
      setMsg({ type: "error", text: "خطأ بالاتصال" });
    } finally {
      setActionLoading(null);
    }
  };

  // Change Role
  const handleChangeRole = async (userId: string, newRole: string) => {
    setActionLoading(`role-${userId}`);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "changeRole", role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: "success", text: data.message });
        fetchAdminData();
      } else {
        setMsg({ type: "error", text: data.error || "فشل التعديل" });
      }
    } catch {
      setMsg({ type: "error", text: "خطأ بالاتصال" });
    } finally {
      setActionLoading(null);
    }
  };

  // Delete User
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`هل أنت تأكد من حذف حساب "${userName}" نهائياً؟`)) return;
    setActionLoading(`delete-${userId}`);
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: "success", text: data.message });
        fetchAdminData();
      } else {
        setMsg({ type: "error", text: data.error || "فشل الحذف" });
      }
    } catch {
      setMsg({ type: "error", text: "خطأ بالاتصال" });
    } finally {
      setActionLoading(null);
    }
  };

  // Delete Review
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("هل أنت تأكد من حذف هذا التقييم؟")) return;
    setActionLoading(`review-${reviewId}`);
    try {
      const res = await fetch(`/api/admin/reviews?reviewId=${reviewId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: "success", text: data.message });
        fetchAdminData();
      } else {
        setMsg({ type: "error", text: data.error || "فشل حذف التقييم" });
      }
    } catch {
      setMsg({ type: "error", text: "خطأ بالاتصال" });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || (u.email && u.email.toLowerCase().includes(q));
  });

  const filteredArtisans = users.filter((u) => u.role === "ARTISAN").filter((u) => {
    const q = searchQuery.toLowerCase();
    const prof = u.artisanProfile?.profession || "";
    const wil = u.artisanProfile?.wilaya || "";
    return u.name.toLowerCase().includes(q) || prof.toLowerCase().includes(q) || wil.toLowerCase().includes(q);
  });

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "6rem 2rem", color: "#6A7A8A" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }} className="animate-pulse">🛡️</div>
        <p style={{ fontWeight: 800, fontSize: "1.1rem", color: "#F0F4F8" }}>جاري تحميل لوحة التحكم الإدارية...</p>
      </div>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }} dir="rtl">
      
      {/* Admin Top Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #131820, #0B0D12)",
          borderRadius: "24px",
          padding: "1.5rem 2rem",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          border: "1px solid rgba(217,162,100,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              width: "54px",
              height: "54px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #D9A264, #A97B3C)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.8rem",
              boxShadow: "0 4px 20px rgba(217,162,100,0.3)",
              color: "#0D0F14",
            }}
          >
            🛡️
          </div>
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#F0F4F8", marginBottom: "0.2rem" }}>
              لوحة تحكم المشرف (Admin Control Panel)
            </h1>
            <p style={{ color: "#A7B8C4", fontWeight: 600, fontSize: "0.9rem" }}>
              إدارة الحسابات، توثيق الحرفيين، ومراقبة نشاط المنصة
            </p>
          </div>
        </div>

        <button
          onClick={handleMakeMeAdmin}
          disabled={actionLoading === "me"}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #D9A264, #A97B3C)",
            color: "#0D0F14",
            border: "none",
            fontWeight: 900,
            fontSize: "0.9rem",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(217,162,100,0.25)",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          👑 {actionLoading === "me" ? "جاري الترقية..." : "تأكيد صلاحية الأدمن لحسابي"}
        </button>
      </div>

      {/* Message Banner */}
      {msg && (
        <div
          style={{
            padding: "1rem 1.5rem",
            borderRadius: "16px",
            background: msg.type === "success" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
            border: `1px solid ${msg.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
            color: msg.type === "success" ? "#4ade80" : "#f87171",
            fontWeight: 800,
            fontSize: "0.95rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{msg.text}</span>
          <button
            onClick={() => setMsg(null)}
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontWeight: 900 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Metrics Grid */}
      {stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
          }}
        >
          {[
            { label: "إجمالي المسجلين", val: stats.totalUsers, icon: "👥", color: "#F0F4F8" },
            { label: "الحرفيون", val: stats.totalArtisans, icon: "👷", color: "#D9A264" },
            { label: "المواطنون", val: stats.totalClients, icon: "👤", color: "#38bdf8" },
            { label: "حرفيون موثقون", val: stats.verifiedArtisans, icon: "✓", color: "#22c55e" },
            { label: "حسابات مميزة", val: stats.premiumArtisans, icon: "⭐", color: "#facc15" },
            { label: "إجمالي التقييمات", val: stats.totalReviews, icon: "💬", color: "#a855f7" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: "#131820",
                borderRadius: "20px",
                padding: "1.2rem",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                border: "1px solid rgba(217,162,100,0.12)",
                display: "flex",
                alignItems: "center",
                gap: "0.85rem",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "14px",
                  background: `${item.color}15`,
                  border: `1px solid ${item.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.3rem",
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: 900, color: item.color, lineHeight: 1.1 }}>
                  {item.val}
                </div>
                <div style={{ fontSize: "0.78rem", color: "#A7B8C4", fontWeight: 700 }}>{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Tabs Container */}
      <div
        style={{
          background: "#131820",
          borderRadius: "24px",
          padding: "1.5rem",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          border: "1px solid rgba(217,162,100,0.18)",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        {/* Tab Headers & Search */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: "0.5rem", background: "#0B0D12", padding: "0.35rem", borderRadius: "16px" }}>
            <button
              onClick={() => setActiveTab("artisans")}
              style={{
                padding: "0.65rem 1.25rem",
                borderRadius: "12px",
                border: "none",
                fontWeight: 900,
                fontSize: "0.9rem",
                cursor: "pointer",
                background: activeTab === "artisans" ? "linear-gradient(135deg, #D9A264, #A97B3C)" : "transparent",
                color: activeTab === "artisans" ? "#0D0F14" : "#A7B8C4",
                transition: "all 0.2s",
              }}
            >
              👷 الحرفيون ({filteredArtisans.length})
            </button>

            <button
              onClick={() => setActiveTab("users")}
              style={{
                padding: "0.65rem 1.25rem",
                borderRadius: "12px",
                border: "none",
                fontWeight: 900,
                fontSize: "0.9rem",
                cursor: "pointer",
                background: activeTab === "users" ? "linear-gradient(135deg, #D9A264, #A97B3C)" : "transparent",
                color: activeTab === "users" ? "#0D0F14" : "#A7B8C4",
                transition: "all 0.2s",
              }}
            >
              👤 جميع المستخدمين ({filteredUsers.length})
            </button>

            <button
              onClick={() => setActiveTab("reviews")}
              style={{
                padding: "0.65rem 1.25rem",
                borderRadius: "12px",
                border: "none",
                fontWeight: 900,
                fontSize: "0.9rem",
                cursor: "pointer",
                background: activeTab === "reviews" ? "linear-gradient(135deg, #D9A264, #A97B3C)" : "transparent",
                color: activeTab === "reviews" ? "#0D0F14" : "#A7B8C4",
                transition: "all 0.2s",
              }}
            >
              ⭐ التقييمات ({reviews.length})
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: "relative", minWidth: "260px" }}>
            <input
              type="text"
              placeholder="ابحث باسم الحرفي، البريد، أو المهنة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "0.7rem 1rem 0.7rem 2.2rem",
                borderRadius: "14px",
                border: "1px solid rgba(217,162,100,0.2)",
                background: "#0D0F14",
                color: "#F0F4F8",
                fontSize: "0.88rem",
                outline: "none",
                fontFamily: "'Cairo', sans-serif",
              }}
            />
            <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", fontSize: "0.85rem", color: "#6A7A8A" }}>
              🔍
            </span>
          </div>
        </div>

        {/* ── TAB 1: ARTISANS MANAGEMENT ── */}
        {activeTab === "artisans" && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(217,162,100,0.18)", color: "#D9A264", fontSize: "0.85rem", fontWeight: 800 }}>
                  <th style={{ padding: "0.85rem 1rem" }}>الحرفي</th>
                  <th style={{ padding: "0.85rem 1rem" }}>المهنة والولاية</th>
                  <th style={{ padding: "0.85rem 1rem" }}>حالة التوثيق (Verified)</th>
                  <th style={{ padding: "0.85rem 1rem" }}>حساب مميز (Premium)</th>
                  <th style={{ padding: "0.85rem 1rem" }}>إجراءات السريعة</th>
                </tr>
              </thead>
              <tbody>
                {filteredArtisans.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "3rem", color: "#6A7A8A" }}>
                      لا يوجد حرفيون يطابقون البحث
                    </td>
                  </tr>
                ) : (
                  filteredArtisans.map((u) => {
                    const profile = u.artisanProfile;
                    if (!profile) return null;

                    return (
                      <tr
                        key={u.id}
                        style={{
                          borderBottom: "1px solid rgba(217,162,100,0.08)",
                          transition: "background 0.2s",
                        }}
                      >
                        {/* Name & Contact */}
                        <td style={{ padding: "1rem" }}>
                          <div style={{ fontWeight: 800, color: "#F0F4F8", fontSize: "0.95rem" }}>
                            {u.name}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#A7B8C4" }}>
                            {u.email || u.phone || "بدون معلومات اتصال"}
                          </div>
                        </td>

                        {/* Profession & Wilaya */}
                        <td style={{ padding: "1rem" }}>
                          <div style={{ fontWeight: 800, color: "#D9A264", fontSize: "0.9rem" }}>
                            {profile.profession}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#A7B8C4" }}>
                            📍 {profile.wilaya} {profile.city ? `(${profile.city})` : ""}
                          </div>
                        </td>

                        {/* Verified Pill */}
                        <td style={{ padding: "1rem" }}>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 800,
                              padding: "0.3rem 0.75rem",
                              borderRadius: "12px",
                              background: profile.isVerified ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.12)",
                              color: profile.isVerified ? "#4ade80" : "#f87171",
                              border: `1px solid ${profile.isVerified ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                            }}
                          >
                            {profile.isVerified ? "✓ موثق معتمد" : "غير موثق"}
                          </span>
                        </td>

                        {/* Premium Pill */}
                        <td style={{ padding: "1rem" }}>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 800,
                              padding: "0.3rem 0.75rem",
                              borderRadius: "12px",
                              background: profile.isPremium ? "rgba(250,204,21,0.15)" : "rgba(255,255,255,0.05)",
                              color: profile.isPremium ? "#facc15" : "#6A7A8A",
                              border: `1px solid ${profile.isPremium ? "rgba(250,204,21,0.3)" : "rgba(255,255,255,0.1)"}`,
                            }}
                          >
                            {profile.isPremium ? "⭐ مميز" : "عادي"}
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td style={{ padding: "1rem" }}>
                          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            <button
                              onClick={() => handleToggle(u.id, "toggleVerify")}
                              disabled={actionLoading === `toggleVerify-${u.id}`}
                              style={{
                                padding: "0.45rem 0.85rem",
                                borderRadius: "10px",
                                background: profile.isVerified ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.15)",
                                border: `1px solid ${profile.isVerified ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`,
                                color: profile.isVerified ? "#f87171" : "#4ade80",
                                fontWeight: 800,
                                fontSize: "0.78rem",
                                cursor: "pointer",
                              }}
                            >
                              {profile.isVerified ? "إلغاء التوثيق" : "✓ توثيق الحساب"}
                            </button>

                            <button
                              onClick={() => handleToggle(u.id, "togglePremium")}
                              disabled={actionLoading === `togglePremium-${u.id}`}
                              style={{
                                padding: "0.45rem 0.85rem",
                                borderRadius: "10px",
                                background: profile.isPremium ? "rgba(255,255,255,0.08)" : "rgba(250,204,21,0.15)",
                                border: `1px solid ${profile.isPremium ? "rgba(255,255,255,0.15)" : "rgba(250,204,21,0.3)"}`,
                                color: profile.isPremium ? "#A7B8C4" : "#facc15",
                                fontWeight: 800,
                                fontSize: "0.78rem",
                                cursor: "pointer",
                              }}
                            >
                              {profile.isPremium ? "إلغاء المميز" : "⭐ ترقية لمميز"}
                            </button>

                            <Link
                              href={`/artisan/${u.id}`}
                              target="_blank"
                              style={{
                                padding: "0.45rem 0.85rem",
                                borderRadius: "10px",
                                background: "rgba(217,162,100,0.1)",
                                border: "1px solid rgba(217,162,100,0.2)",
                                color: "#D9A264",
                                fontWeight: 800,
                                fontSize: "0.78rem",
                                textDecoration: "none",
                              }}
                            >
                              معاينة الملف ↗
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── TAB 2: ALL USERS MANAGEMENT ── */}
        {activeTab === "users" && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(217,162,100,0.18)", color: "#D9A264", fontSize: "0.85rem", fontWeight: 800 }}>
                  <th style={{ padding: "0.85rem 1rem" }}>المستخدم</th>
                  <th style={{ padding: "0.85rem 1rem" }}>البريد الإلكتروني</th>
                  <th style={{ padding: "0.85rem 1rem" }}>نوع الحساب (Role)</th>
                  <th style={{ padding: "0.85rem 1rem" }}>تاريخ التسجيل</th>
                  <th style={{ padding: "0.85rem 1rem" }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "3rem", color: "#6A7A8A" }}>
                      لا يوجد مستخدمون يطابقون البحث
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid rgba(217,162,100,0.08)" }}>
                      <td style={{ padding: "1rem", fontWeight: 800, color: "#F0F4F8" }}>{u.name}</td>
                      <td style={{ padding: "1rem", color: "#A7B8C4", fontSize: "0.88rem" }}>{u.email || "بدون بريد"}</td>
                      <td style={{ padding: "1rem" }}>
                        <select
                          value={u.role || "PENDING"}
                          onChange={(e) => handleChangeRole(u.id, e.target.value)}
                          style={{
                            padding: "0.35rem 0.75rem",
                            borderRadius: "10px",
                            background: "#0D0F14",
                            color: u.role === "ADMIN" ? "#facc15" : u.role === "ARTISAN" ? "#D9A264" : "#38bdf8",
                            border: "1px solid rgba(217,162,100,0.2)",
                            fontWeight: 800,
                            fontSize: "0.82rem",
                            cursor: "pointer",
                          }}
                        >
                          <option value="CLIENT">👤 مواطن (CLIENT)</option>
                          <option value="ARTISAN">⚒️ حرفي (ARTISAN)</option>
                          <option value="ADMIN">👑 مشرف (ADMIN)</option>
                        </select>
                      </td>
                      <td style={{ padding: "1rem", color: "#6A7A8A", fontSize: "0.82rem" }}>
                        {new Date(u.createdAt).toLocaleDateString("ar-DZ")}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          disabled={actionLoading === `delete-${u.id}`}
                          style={{
                            padding: "0.4rem 0.85rem",
                            borderRadius: "10px",
                            background: "rgba(239,68,68,0.12)",
                            border: "1px solid rgba(239,68,68,0.3)",
                            color: "#f87171",
                            fontWeight: 800,
                            fontSize: "0.78rem",
                            cursor: "pointer",
                          }}
                        >
                          🗑️ حذف الحساب
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── TAB 3: REVIEWS MODERATION ── */}
        {activeTab === "reviews" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {reviews.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#6A7A8A" }}>
                لا توجد تقييمات بالمنصة بعد
              </div>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    background: "#0D0F14",
                    borderRadius: "18px",
                    padding: "1.25rem",
                    border: "1px solid rgba(217,162,100,0.12)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
                      <span style={{ fontWeight: 800, color: "#F0F4F8", fontSize: "0.95rem" }}>
                        {rev.client.name}
                      </span>
                      <span style={{ color: "#6A7A8A", fontSize: "0.8rem" }}>قيم الحرفي</span>
                      <span style={{ fontWeight: 800, color: "#D9A264", fontSize: "0.95rem" }}>
                        {rev.artisanProfile.user.name}
                      </span>
                    </div>
                    <div style={{ color: "#facc15", fontWeight: 800, fontSize: "0.9rem", marginBottom: "0.4rem" }}>
                      {"★".repeat(rev.rating)} ({rev.rating}/5)
                    </div>
                    <p style={{ color: "#A7B8C4", fontSize: "0.88rem", margin: 0 }}>
                      "{rev.comment || "بدون تعليق نصي"}"
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteReview(rev.id)}
                    disabled={actionLoading === `review-${rev.id}`}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "12px",
                      background: "rgba(239,68,68,0.12)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      color: "#f87171",
                      fontWeight: 800,
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    🗑️ حذف التقييم
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
