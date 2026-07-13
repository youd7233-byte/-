import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import MessageButton from "./MessageButton";
import ReviewForm from "./ReviewForm";
import { getSession } from "@/lib/session";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id }, include: { artisanProfile: true } });
  if (!user?.artisanProfile) return { title: "حرفي | حِرَفي" };
  return {
    title: `${user.name} — ${user.artisanProfile.profession} | حِرَفي`,
    description: user.artisanProfile.bio || `${user.name} حرفي من ${user.artisanProfile.wilaya}`,
  };
}

export default async function ArtisanProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      artisanProfile: {
        include: {
          reviews: { include: { client: true }, orderBy: { createdAt: "desc" }, take: 10 },
          portfolios: { orderBy: { createdAt: "desc" } },
        },
      },
    },
  });

  if (!user?.artisanProfile) return notFound();
  const profile = user.artisanProfile;
  const avgRating = profile.reviews.length > 0
    ? (profile.reviews.reduce((s, r) => s + r.rating, 0) / profile.reviews.length).toFixed(1)
    : null;

  // Top artisans in same wilaya for "أفضل حرفيون" section
  const topInWilaya = await prisma.artisanProfile.findMany({
    where: { wilaya: profile.wilaya, userId: { not: id } },
    include: { user: true, reviews: true },
    take: 4,
  });
  const topRanked = topInWilaya
    .map((a) => ({
      userId: a.userId,
      name: a.user.name,
      profession: a.profession,
      image: a.user.image,
      avgRating: a.reviews.length > 0
        ? a.reviews.reduce((s, r) => s + r.rating, 0) / a.reviews.length
        : 0,
    }))
    .sort((a, b) => b.avgRating - a.avgRating);

  const years = new Date().getFullYear() - (user.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear()) || 1;

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Navbar />
      
      {/* Background gradient */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 70% 40% at 5% 10%, rgba(181,83,26,0.07) 0%, transparent 55%)",
      }} />

      <main style={{ maxWidth: "980px", margin: "0 auto", padding: "0 1.25rem 3rem", position: "relative", zIndex: 1 }}>
        
        {/* Hero Cover */}
        <div style={{
          background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)",
          borderRadius: "24px", overflow: "hidden",
          boxShadow: "0 8px 40px rgba(26,18,8,0.1)",
          border: "1px solid rgba(200,149,108,0.15)",
          marginBottom: "1.25rem",
        }}>
          {/* Cover Banner */}
          <div style={{
            height: "160px",
            background: profile.isPremium
              ? "linear-gradient(135deg, #D4A843 0%, #b88c2a 50%, #B5531A 100%)"
              : "linear-gradient(135deg, #B5531A 0%, #d45e1a 50%, #e8793a 100%)",
            position: "relative",
          }}>
            {/* Cover pattern overlay */}
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 40%)",
            }} />
            <div style={{ position: "absolute", top: "1rem", left: "1rem", display: "flex", gap: "0.5rem" }}>
              {profile.isPremium && (
                <span style={{
                  background: "rgba(212,168,67,0.95)", color: "#1A1208",
                  padding: "0.3rem 0.9rem", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 900,
                }}>⭐ Premium</span>
              )}
              {profile.isVerified && (
                <span style={{
                  background: "rgba(34,197,94,0.9)", color: "#fff",
                  padding: "0.3rem 0.9rem", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 900,
                }}>✓ موثّق</span>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div style={{ padding: "0 2rem 1.75rem", position: "relative" }}>
            {/* Avatar */}
            <div style={{
              width: "96px", height: "96px", borderRadius: "50%",
              background: user.image ? undefined : "linear-gradient(135deg, var(--terracotta), #d45e1a)",
              backgroundImage: user.image ? `url(${user.image})` : undefined,
              backgroundSize: "cover", backgroundPosition: "center",
              border: "4px solid #fff",
              boxShadow: "0 4px 20px rgba(181,83,26,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2.5rem", marginTop: "-48px", marginBottom: "1rem",
            }}>
              {!user.image && "👷"}
            </div>

            <div className="artisan-hero-inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem", flexWrap: "wrap" }}>
                  <h1 style={{ fontSize: "1.65rem", fontWeight: 900, color: "var(--dark)" }}>{user.name}</h1>
                  {profile.isVerified && <span style={{ color: "#16a34a", fontSize: "1.1rem" }}>✓</span>}
                </div>
                <div style={{ fontSize: "0.95rem", color: "var(--terracotta)", fontWeight: 800, marginBottom: "0.3rem" }}>
                  {profile.profession}
                </div>
                <div style={{ fontSize: "0.88rem", color: "var(--muted)", fontWeight: 600, marginBottom: "0.75rem" }}>
                  📍 {profile.wilaya}{profile.city ? ` / ${profile.city}` : ""}
                </div>
                {avgRating && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <span style={{ color: "#f59e0b", fontSize: "1.1rem" }}>
                      {"★".repeat(Math.round(Number(avgRating)))}{"☆".repeat(5 - Math.round(Number(avgRating)))}
                    </span>
                    <span style={{ fontWeight: 900, color: "var(--dark)" }}>{avgRating}</span>
                    <span style={{ color: "var(--muted)", fontSize: "0.88rem" }}>({profile.reviews.length} تقييم)</span>
                  </div>
                )}
              </div>

              {/* Contact Buttons */}
              <div className="artisan-contact-btns" style={{ display: "flex", gap: "0.75rem", flexShrink: 0, flexWrap: "wrap" }}>
                <MessageButton artisanId={id} />
                <a
                  href={`tel:${user.phone || ""}`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.5rem",
                    padding: "0.85rem 1.5rem",
                    background: "linear-gradient(135deg, var(--terracotta), #d45e1a)",
                    color: "#fff", borderRadius: "12px", fontWeight: 800,
                    fontSize: "0.92rem", textDecoration: "none",
                    boxShadow: "0 4px 16px rgba(181,83,26,0.35)",
                  }}
                >
                  📞 تواصل مع الحرفي
                </a>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="artisan-mini-stats" style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem",
              marginTop: "1.25rem", paddingTop: "1.25rem",
              borderTop: "1px solid rgba(200,149,108,0.15)",
            }}>
              {[
                { icon: "💬", label: "تقييم", value: String(profile.reviews.length) },
                { icon: "📋", label: "طلب مكتمل", value: "—" },
                { icon: "📅", label: "سنوات خبرة", value: `${years}+` },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--dark)" }}>{s.value}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--muted)", fontWeight: 600 }}>{s.icon} {s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="artisan-content-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          
          {/* Bio */}
          {profile.bio && (
            <div style={{
              gridColumn: "1 / -1",
              background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)",
              borderRadius: "20px", padding: "1.75rem",
              boxShadow: "0 4px 24px rgba(26,18,8,0.06)",
              border: "1px solid rgba(200,149,108,0.15)",
            }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--dark)", marginBottom: "1rem" }}>
                📝 نبذة عني
              </h2>
              <p style={{ color: "var(--text)", lineHeight: 1.85, fontSize: "0.97rem" }}>{profile.bio}</p>
            </div>
          )}

          {/* Portfolio */}
          {profile.portfolios.length > 0 && (
            <div style={{
              gridColumn: "1 / -1",
              background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)",
              borderRadius: "20px", padding: "1.75rem",
              boxShadow: "0 4px 24px rgba(26,18,8,0.06)",
              border: "1px solid rgba(200,149,108,0.15)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--dark)" }}>🖼️ معرض الأعمال</h2>
                <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 700 }}>{profile.portfolios.length} صورة</span>
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: "0.85rem",
              }}>
                {profile.portfolios.map((p) => (
                  <div
                    key={p.id}
                    title={p.description || ""}
                    style={{
                      borderRadius: "14px", overflow: "hidden", aspectRatio: "1",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                      backgroundImage: `url('${p.imageUrl}')`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      cursor: "pointer", transition: "transform 0.2s",
                      position: "relative",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                  >
                    {p.description && (
                      <div style={{
                        position: "absolute", bottom: 0, left: 0, right: 0,
                        background: "linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 100%)",
                        padding: "0.5rem", color: "#fff", fontSize: "0.7rem", fontWeight: 700,
                      }}>{p.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div style={{
            gridColumn: profile.reviews.length > 0 ? "1 / -1" : "1 / -1",
            background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)",
            borderRadius: "20px", padding: "1.75rem",
            boxShadow: "0 4px 24px rgba(26,18,8,0.06)",
            border: "1px solid rgba(200,149,108,0.15)",
          }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--dark)", marginBottom: "1.25rem" }}>
              💬 تقييمات العملاء {profile.reviews.length > 0 && `(${profile.reviews.length})`}
            </h2>
            {profile.reviews.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📭</div>
                <p style={{ color: "var(--muted)", fontWeight: 600 }}>لا توجد تقييمات بعد</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {profile.reviews.map((r) => (
                  <div key={r.id} style={{
                    padding: "1.25rem", background: "rgba(181,83,26,0.04)",
                    borderRadius: "14px", borderRight: "4px solid var(--terracotta)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.6rem" }}>
                      <div style={{
                        width: "40px", height: "40px", borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--terracotta), #d45e1a)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontWeight: 900, fontSize: "0.9rem", flexShrink: 0,
                      }}>{r.client.name.charAt(0)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--dark)" }}>{r.client.name}</div>
                        <div style={{ display: "flex", gap: "2px" }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} style={{ color: i < r.rating ? "#f59e0b" : "#e5e7eb", fontSize: "0.9rem" }}>★</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                        {new Date(r.createdAt).toLocaleDateString("ar-DZ")}
                      </div>
                    </div>
                    {r.comment && (
                      <p style={{ color: "var(--text)", fontSize: "0.93rem", lineHeight: 1.75, margin: 0 }}>{r.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Review Form - Only show if logged in and not the profile owner */}
            {session && session.userId !== user.id && (
              <ReviewForm artisanProfileId={profile.id} />
            )}
          </div>

          {/* Top Artisans in Wilaya */}
          {topRanked.length > 0 && (
            <div style={{
              gridColumn: "1 / -1",
              background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)",
              borderRadius: "20px", padding: "1.75rem",
              boxShadow: "0 4px 24px rgba(26,18,8,0.06)",
              border: "1px solid rgba(200,149,108,0.15)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--dark)" }}>
                  🏆 أعلى حرفيون تقييماً في {profile.wilaya}
                </h2>
                <Link href="/dashboard/map" style={{
                  fontSize: "0.85rem", fontWeight: 700, color: "var(--terracotta)",
                  padding: "0.4rem 0.85rem", borderRadius: "8px",
                  border: "1px solid rgba(181,83,26,0.2)",
                }}>عرض الكل ←</Link>
              </div>
              <div className="top-artisans-profile-grid" style={{
                display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.85rem",
              }}>
                {topRanked.map((artisan, i) => (
                  <Link key={artisan.userId} href={`/artisan/${artisan.userId}`} style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: "0.5rem", padding: "1rem 0.75rem",
                    background: i === 0 ? "rgba(212,168,67,0.08)" : "rgba(181,83,26,0.04)",
                    border: `1px solid ${i === 0 ? "rgba(212,168,67,0.25)" : "rgba(200,149,108,0.12)"}`,
                    borderRadius: "16px", textDecoration: "none",
                    transition: "all 0.2s",
                  }}>
                    <div style={{
                      width: "52px", height: "52px", borderRadius: "50%",
                      background: artisan.image ? `url(${artisan.image}) center/cover` : "linear-gradient(135deg, var(--terracotta), #d45e1a)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontWeight: 900, fontSize: "1.1rem",
                      boxShadow: "0 2px 10px rgba(181,83,26,0.2)",
                    }}>
                      {!artisan.image && artisan.name.charAt(0)}
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: 800, fontSize: "0.85rem", color: "var(--dark)", lineHeight: 1.3 }}>{artisan.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--terracotta)", fontWeight: 700 }}>{artisan.profession}</div>
                      <div style={{ fontSize: "0.78rem", color: "#D4A843", fontWeight: 800 }}>★ {artisan.avgRating.toFixed(1)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Back link */}
        <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
          <Link href="/dashboard/map" style={{
            color: "var(--terracotta)", fontWeight: 700,
            textDecoration: "underline", fontSize: "0.95rem",
          }}>
            ← العودة للخريطة
          </Link>
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .artisan-content-grid { grid-template-columns: 1fr !important; }
          .artisan-hero-inner { flex-direction: column !important; }
          .artisan-mini-stats { grid-template-columns: repeat(3,1fr) !important; }
          .top-artisans-profile-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 480px) {
          .artisan-contact-btns { flex-direction: column !important; width: 100%; }
          .artisan-contact-btns a { text-align: center; justify-content: center; }
          .top-artisans-profile-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
