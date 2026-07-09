import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      artisanProfile: {
        include: { reviews: true, portfolios: true },
      },
    },
  });

  if (!user) redirect("/login");

  const isClient = user.role === "CLIENT";

  if (isClient) {
    return (
      <div>
        <div style={{
          display: "flex", alignItems: "center", gap: "1.5rem",
          background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)",
          borderRadius: "24px", padding: "2rem 2.5rem",
          boxShadow: "0 8px 40px rgba(26,18,8,0.08)",
          border: "1px solid rgba(200,149,108,0.15)",
          marginBottom: "2rem",
        }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "1.7rem", fontWeight: 900, color: "var(--dark)", marginBottom: "0.25rem" }}>
              مرحباً، {user.name}!
            </h1>
            <p style={{ color: "var(--muted)", fontWeight: 600 }}>
              عميل في منصة حرفي
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "2rem" }}>
          <Link href="/dashboard/map" style={{
            display: "flex", alignItems: "center", gap: "1rem",
            background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
            borderRadius: "20px", padding: "1.5rem 2rem",
            boxShadow: "0 4px 20px rgba(26,18,8,0.06)",
            border: "1px solid rgba(200,149,108,0.12)",
            textDecoration: "none", color: "var(--dark)",
            transition: "all 0.2s",
          }}>
            <span style={{ fontSize: "2rem" }}>📍</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>ابحث في الخريطة</div>
              <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>اكتشف الحرفيين القريبين منك</div>
            </div>
          </Link>
          <Link href="/dashboard/messages" style={{
            display: "flex", alignItems: "center", gap: "1rem",
            background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
            borderRadius: "20px", padding: "1.5rem 2rem",
            boxShadow: "0 4px 20px rgba(26,18,8,0.06)",
            border: "1px solid rgba(200,149,108,0.12)",
            textDecoration: "none", color: "var(--dark)",
            transition: "all 0.2s",
          }}>
            <span style={{ fontSize: "2rem" }}>💬</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>الرسائل</div>
              <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>تواصل مع الحرفيين</div>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // Artisan view
  const profile = user.artisanProfile!;
  const avgRating = profile.reviews.length > 0
    ? (profile.reviews.reduce((s, r) => s + r.rating, 0) / profile.reviews.length).toFixed(1)
    : null;

  return (
    <div>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: "1.5rem",
        background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)",
        borderRadius: "24px", padding: "2rem 2.5rem",
        boxShadow: "0 8px 40px rgba(26,18,8,0.08)",
        border: "1px solid rgba(200,149,108,0.15)",
        marginBottom: "2rem",
      }}>
        <div style={{
          width: "80px", height: "80px", borderRadius: "50%",
          background: user.image ? `url(${user.image}) center/cover` : "linear-gradient(135deg, var(--terracotta), #d45e1a)",
          flexShrink: 0, fontSize: "2rem", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 24px rgba(181,83,26,0.25)",
        }}>
          {!user.image && "👷"}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "1.7rem", fontWeight: 900, color: "var(--dark)", marginBottom: "0.25rem" }}>
            مرحباً، {user.name}!
          </h1>
          <p style={{ color: "var(--muted)", fontWeight: 600 }}>
            {profile.profession} • {profile.wilaya} {profile.city ? `/ ${profile.city}` : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {profile.isVerified && (
            <span style={{
              background: "rgba(34,197,94,0.1)", color: "#16a34a",
              padding: "0.4rem 1rem", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 800,
            }}>✓ موثّق</span>
          )}
          {profile.isPremium && (
            <span style={{
              background: "rgba(212,168,67,0.15)", color: "#b45309",
              padding: "0.4rem 1rem", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 800,
            }}>⭐ Premium</span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem", marginBottom: "2rem" }}>
        {[
          { icon: "⭐", label: "متوسط التقييم", value: avgRating ? `${avgRating}/5` : "لا يوجد بعد", color: "#b45309" },
          { icon: "💬", label: "عدد التقييمات", value: `${profile.reviews.length}`, color: "var(--terracotta)" },
          { icon: "🖼️", label: "صور الأعمال", value: `${profile.portfolios.length}`, color: "#0369a1" },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
            borderRadius: "20px", padding: "1.75rem 1.5rem",
            boxShadow: "0 4px 20px rgba(26,18,8,0.06)",
            border: "1px solid rgba(200,149,108,0.12)",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "2.2rem", marginBottom: "0.5rem" }}>{stat.icon}</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: stat.color, marginBottom: "0.25rem" }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "0.88rem", color: "var(--muted)", fontWeight: 600 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "2rem" }}>
        <Link href="/dashboard/settings" style={{
          display: "flex", alignItems: "center", gap: "1rem",
          background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
          borderRadius: "20px", padding: "1.5rem 2rem",
          boxShadow: "0 4px 20px rgba(26,18,8,0.06)",
          border: "1px solid rgba(200,149,108,0.12)",
          textDecoration: "none", color: "var(--dark)",
          transition: "all 0.2s",
        }}>
          <span style={{ fontSize: "2rem" }}>⚙️</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>الإعدادات وتعديل الملف</div>
            <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>تحديث بياناتك وصورك</div>
          </div>
        </Link>
        <Link href={`/artisan/${user.id}`} style={{
          display: "flex", alignItems: "center", gap: "1rem",
          background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
          borderRadius: "20px", padding: "1.5rem 2rem",
          boxShadow: "0 4px 20px rgba(26,18,8,0.06)",
          border: "1px solid rgba(200,149,108,0.12)",
          textDecoration: "none", color: "var(--dark)",
          transition: "all 0.2s",
        }}>
          <span style={{ fontSize: "2rem" }}>👤</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>عرض ملفي العام</div>
            <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>ما يراه العملاء</div>
          </div>
        </Link>
      </div>

      {/* No location warning */}
      {!profile.lat && (
        <div style={{
          marginBottom: "1.5rem",
          background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)",
          borderRadius: "16px", padding: "1.25rem 1.5rem",
          display: "flex", alignItems: "center", gap: "1rem",
        }}>
          <span style={{ fontSize: "1.5rem" }}>📍</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 800, color: "#92400e" }}>لم تحدد موقعك بعد!</p>
            <p style={{ fontSize: "0.88rem", color: "#b45309" }}>
              أضف موقعك في الإعدادات لكي يتمكن العملاء القريبون منك من إيجادك
            </p>
          </div>
          <Link href="/dashboard/settings" style={{
            padding: "0.65rem 1.25rem", borderRadius: "12px",
            background: "var(--terracotta)", color: "#fff",
            fontWeight: 700, fontSize: "0.9rem", textDecoration: "none",
          }}>إضافة الموقع</Link>
        </div>
      )}
    </div>
  );
}
