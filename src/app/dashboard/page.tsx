import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      artisanProfile: {
        include: {
          reviews: { include: { client: true }, orderBy: { createdAt: "desc" }, take: 5 },
          portfolios: true,
        },
      },
    },
  });

  if (!user) redirect("/login");

  const isClient = user.role === "CLIENT";

  if (isClient) {
    // Get top artisans overall for the client dashboard
    const topArtisans = await prisma.artisanProfile.findMany({
      include: { user: true, reviews: true },
      take: 6,
    });
    
    const topRankedArtisans = topArtisans
      .map((a) => ({
        userId: a.userId,
        name: a.user.name,
        profession: a.profession,
        image: a.user.image,
        wilaya: a.wilaya,
        avgRating: a.reviews.length > 0
          ? a.reviews.reduce((s, r) => s + r.rating, 0) / a.reviews.length
          : 0,
      }))
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 4);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Client Welcome */}
        <div style={{
          background: "linear-gradient(135deg, var(--terracotta) 0%, #d45e1a 100%)",
          borderRadius: "24px", padding: "2rem 2.5rem",
          boxShadow: "0 8px 32px rgba(181,83,26,0.3)",
          color: "#fff",
        }}>
          <h1 style={{ fontSize: "1.7rem", fontWeight: 900, marginBottom: "0.35rem", color: "#fff" }}>
            مرحباً، {user.name}! 👋
          </h1>
          <p style={{ opacity: 0.85, fontWeight: 600 }}>
            ابحث عن أفضل الحرفيين القريبين منك
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }} className="client-actions-grid">
          {[
            { href: "/dashboard/map", icon: "📍", title: "ابحث في الخريطة", desc: "اكتشف الحرفيين القريبين منك", color: "#B5531A" },
            { href: "/dashboard/messages", icon: "💬", title: "الرسائل", desc: "تواصل مع الحرفيين", color: "#0369a1" },
          ].map((action) => (
            <Link key={action.href} href={action.href} style={{
              display: "flex", alignItems: "center", gap: "1.25rem",
              background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
              borderRadius: "20px", padding: "1.5rem 2rem",
              boxShadow: "0 4px 20px rgba(26,18,8,0.06)",
              border: "1px solid rgba(200,149,108,0.12)",
              textDecoration: "none", color: "var(--dark)",
              transition: "all 0.2s",
            }}>
              <div style={{
                width: "52px", height: "52px", borderRadius: "14px",
                background: `${action.color}18`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.6rem", flexShrink: 0,
              }}>{action.icon}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>{action.title}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{action.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Top Artisans Section for Client */}
        <div style={{
          background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
          borderRadius: "20px", padding: "1.5rem",
          boxShadow: "0 4px 20px rgba(26,18,8,0.06)",
          border: "1px solid rgba(200,149,108,0.12)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--dark)" }}>
              🏆 أفضل الحرفيين تقييماً
            </h2>
            <Link href="/dashboard/map" style={{
              fontSize: "0.85rem", fontWeight: 700, color: "var(--terracotta)",
              padding: "0.4rem 0.85rem", borderRadius: "8px",
              border: "1px solid rgba(181,83,26,0.2)",
            }}>عرض الكل في الخريطة ←</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            {topRankedArtisans.map((artisan, i) => (
              <Link key={artisan.userId} href={`/artisan/${artisan.userId}`} style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: "0.5rem", padding: "1.25rem 1rem",
                background: i === 0 ? "rgba(212,168,67,0.08)" : "rgba(181,83,26,0.04)",
                border: `1px solid ${i === 0 ? "rgba(212,168,67,0.25)" : "rgba(200,149,108,0.12)"}`,
                borderRadius: "16px", textDecoration: "none",
                transition: "all 0.2s",
              }}>
                <div style={{
                  width: "56px", height: "56px", borderRadius: "50%",
                  background: artisan.image ? `url(${artisan.image}) center/cover` : "linear-gradient(135deg, var(--terracotta), #d45e1a)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 900, fontSize: "1.2rem",
                  boxShadow: "0 2px 10px rgba(181,83,26,0.2)",
                }}>
                  {!artisan.image && artisan.name.charAt(0)}
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--dark)" }}>{artisan.name}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--terracotta)", fontWeight: 700 }}>{artisan.profession}</div>
                  <div style={{ fontSize: "0.85rem", color: "#D4A843", fontWeight: 800 }}>★ {artisan.avgRating.toFixed(1)}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // === Artisan Dashboard ===
  const profile = user.artisanProfile!;
  const avgRating = profile.reviews.length > 0
    ? (profile.reviews.reduce((s, r) => s + r.rating, 0) / profile.reviews.length).toFixed(1)
    : null;

  // Get top artisans in same wilaya for leaderboard
  const topInWilaya = await prisma.artisanProfile.findMany({
    where: { wilaya: profile.wilaya },
    include: { user: true, reviews: true },
    take: 5,
  });

  const topRanked = topInWilaya
    .map((a) => ({
      id: a.id,
      userId: a.userId,
      name: a.user.name,
      profession: a.profession,
      image: a.user.image,
      avgRating: a.reviews.length > 0
        ? a.reviews.reduce((s, r) => s + r.rating, 0) / a.reviews.length
        : 0,
      reviewCount: a.reviews.length,
    }))
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 5);

  return (
    <div className="artisan-dash" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Profile Hero */}
      <div style={{
        background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)",
        borderRadius: "24px", padding: "0",
        boxShadow: "0 8px 40px rgba(26,18,8,0.08)",
        border: "1px solid rgba(200,149,108,0.15)",
        overflow: "hidden",
      }}>
        {/* Cover */}
        <div style={{
          height: "120px",
          background: "linear-gradient(135deg, #B5531A 0%, #d45e1a 50%, #D4A843 100%)",
          position: "relative",
        }}>
          {profile.isPremium && (
            <div style={{
              position: "absolute", top: "1rem", left: "1rem",
              background: "rgba(212,168,67,0.95)", color: "#1A1208",
              padding: "0.3rem 0.9rem", borderRadius: "20px",
              fontSize: "0.8rem", fontWeight: 900,
            }}>⭐ Premium</div>
          )}
          {profile.isVerified && (
            <div style={{
              position: "absolute", top: "1rem", right: "1rem",
              background: "rgba(34,197,94,0.9)", color: "#fff",
              padding: "0.3rem 0.9rem", borderRadius: "20px",
              fontSize: "0.8rem", fontWeight: 900,
            }}>✓ موثّق</div>
          )}
        </div>
        
        {/* Profile Info */}
        <div style={{ padding: "0 2rem 1.5rem", position: "relative" }}>
          {/* Avatar */}
          <div style={{
            width: "88px", height: "88px", borderRadius: "50%",
            background: user.image ? `url(${user.image}) center/cover` : "linear-gradient(135deg, var(--terracotta), #d45e1a)",
            border: "4px solid #fff",
            boxShadow: "0 4px 20px rgba(181,83,26,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "2.2rem",
            marginTop: "-44px",
            marginBottom: "0.75rem",
          }}>
            {!user.image && "👷"}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--dark)", marginBottom: "0.2rem" }}>
                {user.name}
              </h1>
              <div style={{ fontSize: "0.9rem", color: "var(--terracotta)", fontWeight: 700, marginBottom: "0.25rem" }}>
                {profile.profession}
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.35rem" }}>
                📍 {profile.wilaya}{profile.city ? ` / ${profile.city}` : ""}
              </div>
              {avgRating && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.4rem" }}>
                  <span style={{ color: "#f59e0b", fontSize: "1rem" }}>
                    {"★".repeat(Math.round(Number(avgRating)))}{"☆".repeat(5 - Math.round(Number(avgRating)))}
                  </span>
                  <span style={{ fontWeight: 900, color: "var(--dark)", fontSize: "0.9rem" }}>{avgRating}</span>
                  <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>({profile.reviews.length} تقييم)</span>
                </div>
              )}
            </div>
            <Link href="/dashboard/settings" style={{
              padding: "0.65rem 1.25rem", borderRadius: "12px",
              background: "rgba(181,83,26,0.08)", color: "var(--terracotta)",
              fontWeight: 800, fontSize: "0.88rem", textDecoration: "none",
              border: "1.5px solid rgba(181,83,26,0.2)",
              display: "flex", alignItems: "center", gap: "0.4rem",
            }}>
              ✏️ تعديل الملف
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="artisan-stats-grid" style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem",
      }}>
        {[
          { icon: "⭐", label: "التقييم", value: avgRating || "—", sub: "من 5", color: "#D4A843" },
          { icon: "💬", label: "التعليقات", value: String(profile.reviews.length), sub: "تقييم مستلم", color: "#B5531A" },
          { icon: "🖼️", label: "صور الأعمال", value: String(profile.portfolios.length), sub: "صورة منشورة", color: "#0369a1" },
          { icon: "📅", label: "طلبات الشهر", value: "—", sub: "طلب هذا الشهر", color: "#7c3aed" },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
            borderRadius: "18px", padding: "1.25rem 1rem",
            boxShadow: "0 4px 20px rgba(26,18,8,0.06)",
            border: "1px solid rgba(200,149,108,0.12)",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "1.6rem", marginBottom: "0.35rem" }}>{stat.icon}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: stat.color, lineHeight: 1.1 }}>{stat.value}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--dark)", fontWeight: 800, marginTop: "0.2rem" }}>{stat.label}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "2px" }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="artisan-actions-grid">
        {[
          { href: "/dashboard/map", icon: "📍", title: "خريطة الحرفيين", desc: "اكتشف المنطقة وزملائك", color: "#B5531A" },
          { href: "/dashboard/messages", icon: "💬", title: "الرسائل", desc: "تواصل مع العملاء", color: "#0369a1" },
          { href: "/dashboard/settings", icon: "⚙️", title: "الإعدادات", desc: "تحديث بياناتك وصورك", color: "#7c3aed" },
          { href: `/artisan/${user.id}`, icon: "👤", title: "ملفي العام", desc: "ما يراه العملاء", color: "#D4A843" },
        ].map((action) => (
          <Link key={action.href} href={action.href} style={{
            display: "flex", alignItems: "center", gap: "1rem",
            background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
            borderRadius: "18px", padding: "1.25rem 1.5rem",
            boxShadow: "0 4px 20px rgba(26,18,8,0.06)",
            border: "1px solid rgba(200,149,108,0.12)",
            textDecoration: "none", color: "var(--dark)",
            transition: "all 0.2s",
          }}>
            <div style={{
              width: "46px", height: "46px", borderRadius: "12px",
              background: `${action.color}18`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.4rem", flexShrink: 0,
            }}>{action.icon}</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>{action.title}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{action.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Reviews + Top Artisans in wilaya */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }} className="artisan-bottom-grid">
        
        {/* Recent Reviews */}
        <div style={{
          background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
          borderRadius: "20px", padding: "1.5rem",
          boxShadow: "0 4px 20px rgba(26,18,8,0.06)",
          border: "1px solid rgba(200,149,108,0.12)",
        }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 900, color: "var(--dark)", marginBottom: "1rem" }}>
            💬 آخر التعليقات والتقييمات
          </h2>
          {profile.reviews.length === 0 ? (
            <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--muted)" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📭</div>
              <p style={{ fontWeight: 600 }}>لا توجد تقييمات بعد</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {profile.reviews.slice(0, 3).map((r) => (
                <div key={r.id} style={{
                  padding: "0.85rem", background: "rgba(181,83,26,0.04)",
                  borderRadius: "12px", borderRight: "3px solid var(--terracotta)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                    <div style={{
                      width: "30px", height: "30px", borderRadius: "50%",
                      background: "linear-gradient(135deg, var(--terracotta), #d45e1a)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontWeight: 900, fontSize: "0.8rem", flexShrink: 0,
                    }}>{r.client.name.charAt(0)}</div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "0.85rem", color: "var(--dark)" }}>{r.client.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#f59e0b" }}>{"★".repeat(r.rating)}</div>
                    </div>
                    <div style={{ marginRight: "auto", fontSize: "0.72rem", color: "var(--muted)" }}>
                      {new Date(r.createdAt).toLocaleDateString("ar-DZ")}
                    </div>
                  </div>
                  {r.comment && (
                    <p style={{ color: "var(--text)", fontSize: "0.82rem", lineHeight: 1.6, margin: 0 }}>
                      {r.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Artisans in Wilaya */}
        <div style={{
          background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
          borderRadius: "20px", padding: "1.5rem",
          boxShadow: "0 4px 20px rgba(26,18,8,0.06)",
          border: "1px solid rgba(200,149,108,0.12)",
        }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 900, color: "var(--dark)", marginBottom: "1rem" }}>
            🏆 أفضل حرفيون في {profile.wilaya}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {topRanked.map((artisan, i) => (
              <Link key={artisan.id} href={`/artisan/${artisan.userId}`} style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                textDecoration: "none", padding: "0.65rem",
                borderRadius: "12px",
                background: artisan.userId === user.id ? "rgba(181,83,26,0.08)" : "transparent",
                border: artisan.userId === user.id ? "1.5px solid rgba(181,83,26,0.2)" : "1.5px solid transparent",
                transition: "all 0.2s",
              }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  background: i === 0 ? "#D4A843" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "var(--sand)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 900, fontSize: "0.82rem",
                  color: i < 3 ? "#fff" : "var(--dark)", flexShrink: 0,
                }}>{i + 1}</div>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: artisan.image ? `url(${artisan.image}) center/cover` : "linear-gradient(135deg, var(--terracotta), #d45e1a)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 900, fontSize: "0.9rem", flexShrink: 0,
                }}>
                  {!artisan.image && artisan.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: "0.88rem", color: "var(--dark)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {artisan.name} {artisan.userId === user.id && "(أنت)"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--terracotta)", fontWeight: 700 }}>{artisan.profession}</div>
                </div>
                <div style={{ fontSize: "0.78rem", color: "#D4A843", fontWeight: 800, flexShrink: 0 }}>
                  ★ {artisan.avgRating.toFixed(1)}
                </div>
              </Link>
            ))}
            {topRanked.length === 0 && (
              <p style={{ color: "var(--muted)", textAlign: "center", padding: "1rem" }}>لا يوجد بيانات بعد</p>
            )}
          </div>
        </div>
      </div>

      {/* Location Warning */}
      {!profile.lat && (
        <div style={{
          background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)",
          borderRadius: "16px", padding: "1.25rem 1.5rem",
          display: "flex", alignItems: "center", gap: "1rem",
        }}>
          <span style={{ fontSize: "1.5rem" }}>📍</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 800, color: "#92400e" }}>لم تحدد موقعك بعد!</p>
            <p style={{ fontSize: "0.85rem", color: "#b45309" }}>
              أضف موقعك في الإعدادات لكي يتمكن العملاء القريبون منك من إيجادك
            </p>
          </div>
          <Link href="/dashboard/settings" style={{
            padding: "0.65rem 1.25rem", borderRadius: "12px",
            background: "var(--terracotta)", color: "#fff",
            fontWeight: 700, fontSize: "0.9rem", textDecoration: "none", flexShrink: 0,
          }}>إضافة الموقع</Link>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .artisan-stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .artisan-bottom-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .artisan-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .artisan-actions-grid { grid-template-columns: 1fr 1fr !important; }
          .client-actions-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 420px) {
          .artisan-actions-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
