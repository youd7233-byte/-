import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { logoutAction } from "@/app/actions/artisan";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "لوحة التحكم | حِرَفي",
  description: "إدارة ملفك الشخصي وطلباتك على منصة حِرَفي",
};

export default async function DashboardPage() {
  // Deep session verification on the server
  const session = await getSession();
  if (!session) redirect("/login");

  // Fetch full profile for the dashboard
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      artisanProfile: {
        include: {
          reviews: { select: { rating: true } },
          portfolios: { select: { id: true } },
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const profile = user.artisanProfile;
  const avgRating = profile?.reviews.length
    ? (profile.reviews.reduce((s, r) => s + r.rating, 0) / profile.reviews.length).toFixed(1)
    : null;

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Navbar />

      {/* Background decoration */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 60% 40% at 80% 10%, rgba(212,168,67,0.07) 0%, transparent 60%)",
      }} />

      <main className="dashboard-main" style={{ maxWidth: "1100px", margin: "0 auto", padding: "3rem 1.5rem", position: "relative", zIndex: 1 }}>
        {/* Welcome Header */}
        <div style={{
          background: "linear-gradient(135deg, var(--dark) 0%, var(--mid) 100%)",
          borderRadius: "28px",
          padding: "2.5rem 3rem",
          marginBottom: "2rem",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(26,18,8,0.2)",
        }}>
          {/* Decorative blob */}
          <div style={{
            position: "absolute", top: "-30px", left: "-30px",
            width: "200px", height: "200px",
            background: "rgba(212,168,67,0.08)",
            borderRadius: "50%", filter: "blur(40px)",
          }} />

          <div className="dashboard-welcome" style={{ position: "relative", zIndex: 1 }}>
            <div className="dashboard-header-inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.5rem" }}>
              <div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.35rem 1rem",
                  background: "rgba(212,168,67,0.15)",
                  border: "1px solid rgba(212,168,67,0.25)",
                  borderRadius: "999px",
                  color: "var(--gold)",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  marginBottom: "1rem",
                }}>
                  {profile?.isPremium ? "⭐ حرفي مميز" : "👋 حرفي أساسي"}
                </div>
                <h1 style={{ fontSize: "1.9rem", fontWeight: 900, color: "#fff", marginBottom: "0.4rem" }}>
                  أهلاً، {user.name}!
                </h1>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem" }}>
                  {profile ? `${profile.profession} • ${profile.wilaya}` : "أكمل ملفك الشخصي لتبدأ"}
                </p>
              </div>

              {/* Logout form */}
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="dashboard-btn-logout"
                  style={{
                    padding: "0.75rem 1.75rem",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "rgba(255,255,255,0.8)",
                    fontFamily: "'Cairo', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  🚪 تسجيل الخروج
                </button>
              </form>
            </div>
          </div>

        {/* Stats Grid */}
        {profile && (
          <div className="dashboard-stats-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.25rem",
            marginBottom: "2rem",
          }}>
            {[
              { icon: "⭐", label: "التقييم", value: avgRating ? `${avgRating}/5` : "لا يوجد بعد", sub: `${profile.reviews.length} تقييم` },
              { icon: "🖼️", label: "صور الأعمال", value: profile.portfolios.length, sub: "مرفوعة" },
              { icon: "📍", label: "الموقع", value: profile.wilaya, sub: profile.city || "محدد على الخريطة" },
              {
                icon: profile.isVerified ? "✅" : "🔄",
                label: "الحالة",
                value: profile.isVerified ? "موثّق" : "قيد المراجعة",
                sub: profile.isPremium ? "باقة مميزة" : "باقة مجانية",
              },
            ].map(({ icon, label, value, sub }) => (
              <div
                key={label}
                style={{
                  background: "#fff",
                  borderRadius: "20px",
                  padding: "1.5rem",
                  border: "1px solid rgba(200,149,108,0.15)",
                  boxShadow: "0 4px 20px rgba(26,18,8,0.06)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 36px rgba(26,18,8,0.1)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(26,18,8,0.06)";
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{icon}</div>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--muted)", marginBottom: "0.25rem" }}>{label}</div>
                <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--dark)" }}>{value}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.2rem" }}>{sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div style={{
          background: "#fff",
          borderRadius: "24px",
          padding: "2rem",
          border: "1px solid rgba(200,149,108,0.15)",
          boxShadow: "0 4px 20px rgba(26,18,8,0.06)",
        }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--dark)", marginBottom: "1.5rem" }}>
            الإجراءات السريعة
          </h2>
          <div className="dashboard-actions-flex" style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {[
              { href: "/search", icon: "🔍", label: "تصفح الحرفيين", desc: "ابحث عن حرفيين آخرين" },
              { href: "/", icon: "🏠", label: "الصفحة الرئيسية", desc: "العودة للرئيسية" },
            ].map(({ href, icon, label, desc }) => (
              <Link
                key={label}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem 1.5rem",
                  borderRadius: "16px",
                  border: "2px solid rgba(200,149,108,0.15)",
                  background: "var(--cream)",
                  color: "var(--dark)",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  transition: "all 0.22s",
                  textDecoration: "none",
                  minWidth: "200px",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--terracotta)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(181,83,26,0.04)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,149,108,0.15)";
                  (e.currentTarget as HTMLElement).style.background = "var(--cream)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>{icon}</span>
                <div>
                  <div>{label}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 500 }}>{desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Upgrade Banner for free users */}
        {profile && !profile.isPremium && (
          <div className="dashboard-upgrade-banner" style={{
            marginTop: "1.5rem",
            background: "linear-gradient(135deg, rgba(212,168,67,0.12) 0%, rgba(181,83,26,0.08) 100%)",
            border: "1px solid rgba(212,168,67,0.3)",
            borderRadius: "20px",
            padding: "1.75rem 2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1.5rem",
            flexWrap: "wrap",
          }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: "1.1rem", color: "var(--dark)", marginBottom: "0.35rem" }}>
                ⭐ ارتقِ للباقة المميزة
              </div>
              <p style={{ fontSize: "0.9rem", color: "var(--muted)", margin: 0 }}>
                ظهور في أعلى نتائج البحث، حتى 20 صورة، وشارة &quot;حرفي موثّق&quot;
              </p>
            </div>
            <button
              style={{
                padding: "0.85rem 2rem",
                borderRadius: "14px",
                background: "var(--gold)",
                color: "var(--dark)",
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 900,
                fontSize: "0.95rem",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxShadow: "0 8px 24px rgba(212,168,67,0.3)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(212,168,67,0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(212,168,67,0.3)";
              }}
            >
              ترقية الحساب — 500 دج/شهر
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
