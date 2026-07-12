import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import MessageButton from "./MessageButton";

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

  const card: React.CSSProperties = {
    background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)",
    borderRadius: "22px", padding: "2rem",
    boxShadow: "0 4px 24px rgba(26,18,8,0.07)",
    border: "1px solid rgba(200,149,108,0.15)",
  };

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Navbar />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 70% 40% at 5% 10%, rgba(181,83,26,0.07) 0%, transparent 55%)" }} />

      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "2.5rem 1.5rem", position: "relative", zIndex: 1 }}>

        {/* Hero Card */}
        <div style={{ ...card, display: "flex", gap: "2rem", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <div style={{
            width: "100px", height: "100px", borderRadius: "50%", flexShrink: 0,
            background: user.image ? undefined : "linear-gradient(135deg, var(--terracotta), #d45e1a)",
            backgroundImage: user.image ? `url(${user.image})` : undefined,
            backgroundSize: "cover", backgroundPosition: "center",
            boxShadow: "0 8px 28px rgba(181,83,26,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem",
          }}>
            {!user.image && "👷"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "0.6rem" }}>
              {profile.isVerified && <span style={{ background: "rgba(34,197,94,0.12)", color: "#16a34a", padding: "0.3rem 0.9rem", borderRadius: "20px", fontSize: "0.82rem", fontWeight: 800 }}>✓ موثّق</span>}
              {profile.isPremium && <span style={{ background: "rgba(212,168,67,0.15)", color: "#b45309", padding: "0.3rem 0.9rem", borderRadius: "20px", fontSize: "0.82rem", fontWeight: 800 }}>⭐ Premium</span>}
              <span style={{ background: "rgba(181,83,26,0.08)", color: "var(--terracotta)", padding: "0.3rem 0.9rem", borderRadius: "20px", fontSize: "0.82rem", fontWeight: 800 }}>{profile.profession}</span>
            </div>
            <h1 style={{ fontSize: "1.9rem", fontWeight: 900, color: "var(--dark)", marginBottom: "0.35rem" }}>{user.name}</h1>
            <p style={{ color: "var(--muted)", fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem" }}>
              📍 {profile.wilaya}{profile.city ? ` / ${profile.city}` : ""}
            </p>
            {avgRating && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ color: "#f59e0b", fontSize: "1.1rem" }}>{"★".repeat(Math.round(Number(avgRating)))}</span>
                <span style={{ fontWeight: 800, color: "var(--dark)" }}>{avgRating}</span>
                <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>({profile.reviews.length} تقييم)</span>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <MessageButton artisanId={id} />
            <a href={`tel:${user.phone || ""}`} style={{
              display: "inline-flex", alignItems: "center", gap: "0.6rem", padding: "0.9rem 1.75rem",
              background: "linear-gradient(135deg, var(--terracotta) 0%, #d45e1a 100%)",
              color: "#fff", borderRadius: "14px", fontFamily: "'Cairo',sans-serif",
              fontWeight: 800, fontSize: "1rem", textDecoration: "none",
              boxShadow: "0 6px 20px rgba(181,83,26,0.3)",
            }}>📞 اتصال</a>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          {profile.bio && (
            <div style={{ ...card, gridColumn: "1 / -1" }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 900, color: "var(--dark)", marginBottom: "1rem" }}>📝 نبذة عنه</h2>
              <p style={{ color: "var(--text)", lineHeight: 1.8, fontSize: "0.97rem" }}>{profile.bio}</p>
            </div>
          )}

          {profile.portfolios.length > 0 && (
            <div style={{ ...card, gridColumn: "1 / -1" }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 900, color: "var(--dark)", marginBottom: "1.25rem" }}>🖼️ معرض الأعمال</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: "1rem" }}>
                {profile.portfolios.map((p) => (
                  <div key={p.id} style={{
                    borderRadius: "14px", overflow: "hidden",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)", aspectRatio: "1",
                    background: `url(${p.imageUrl}) center/cover`,
                  }} />
                ))}
              </div>
            </div>
          )}

          <div style={{ ...card, gridColumn: "1 / -1" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 900, color: "var(--dark)", marginBottom: "1.25rem" }}>
              💬 تقييمات العملاء {profile.reviews.length > 0 && `(${profile.reviews.length})`}
            </h2>
            {profile.reviews.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
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
                        width: "38px", height: "38px", borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--terracotta), #d45e1a)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontWeight: 900, fontSize: "0.9rem", flexShrink: 0,
                      }}>{r.client.name.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--dark)" }}>{r.client.name}</div>
                        <div style={{ display: "flex", gap: "2px" }}>
                          {Array.from({length:5}).map((_,i) => (
                            <span key={i} style={{ color: i < r.rating ? "#f59e0b" : "#e5e7eb", fontSize: "0.85rem" }}>★</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {r.comment && <p style={{ color: "var(--text)", fontSize: "0.93rem", lineHeight: 1.7 }}>{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
          <Link href="/map" style={{ color: "var(--terracotta)", fontWeight: 700, textDecoration: "underline", fontSize: "0.95rem" }}>
            ← العودة للخريطة
          </Link>
        </div>
      </main>
    </div>
  );
}
