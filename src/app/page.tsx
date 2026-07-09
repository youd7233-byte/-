import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default async function HomePage() {
  const session = await getSession();

  // Redirect logged-in users to appropriate pages
  if (session?.userId) {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { artisanProfile: true },
    });
    if (user) {
      if (!user.role) redirect("/choose-role");
      if (user.role === "ARTISAN" && !user.artisanProfile) redirect("/complete-profile");
      if (user.role === "ARTISAN") redirect("/dashboard");
      // CLIENT falls through to homepage
    }
  }

  // Get featured artisans for homepage
  const featuredArtisans = await prisma.artisanProfile.findMany({
    where: { OR: [{ isPremium: true }, { isVerified: true }] },
    include: {
      user: { select: { id: true, name: true, image: true } },
      reviews: { select: { rating: true } },
    },
    take: 6,
    orderBy: [{ isPremium: "desc" }, { isVerified: "desc" }],
  });

  const STATS = [
    { icon: "??", value: "+10,000", label: "????? ??? ???" },
    { icon: "??", value: "+2,500", label: "???? ?????", featured: true },
    { icon: "?", value: "4.9/5", label: "??? ???????" },
  ];

  const CRAFTS = [
    { icon: "???", label: "?????" },
    { icon: "?", label: "??????" },
    { icon: "??", label: "?????" },
    { icon: "??", label: "????" },
    { icon: "???", label: "????" },
    { icon: "??", label: "?????" },
    { icon: "??", label: "????????" },
    { icon: "??", label: "????" },
  ];

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "var(--cream)", color: "var(--text)" }}>
      <Navbar />

      {/* Hero */}
      <header style={{
        minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", textAlign: "center", padding: "6rem 1.5rem 4rem",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 80% 60% at 50% -5%, rgba(181,83,26,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(212,168,67,0.09) 0%, transparent 55%)",
        }} />

        <div style={{
          display: "inline-flex", alignItems: "center", gap: "0.6rem",
          background: "rgba(181,83,26,0.08)", border: "1px solid rgba(181,83,26,0.15)",
          padding: "0.6rem 1.4rem", borderRadius: "40px",
          fontSize: "0.88rem", fontWeight: 700, color: "var(--terracotta)",
          marginBottom: "2rem", animation: "fadeUp 0.5s ease both",
        }}>
          <span>?</span> ?????? ????????? ????????
        </div>

        <h1 style={{
          fontSize: "clamp(2.4rem, 6vw, 4.2rem)", fontWeight: 900, lineHeight: 1.15,
          color: "var(--dark)", maxWidth: "800px", marginBottom: "1.5rem",
          animation: "fadeUp 0.6s ease 0.1s both",
        }}>
          ???? ??? <span style={{ color: "var(--terracotta)" }}>???? ????????</span>
          <br />?? ?????? ?????
        </h1>

        <p style={{
          fontSize: "1.15rem", color: "var(--muted)", maxWidth: "560px",
          lineHeight: 1.75, marginBottom: "2.5rem",
          animation: "fadeUp 0.6s ease 0.2s both",
        }}>
          ???? ???????? ?????????? ??????? ??????? ??????? ?? ?????? ??? ????????? ?????
        </p>

        <div style={{
          display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center",
          animation: "fadeUp 0.6s ease 0.3s both",
        }}>
          <Link href="/search" style={{
            display: "inline-flex", alignItems: "center", gap: "0.6rem",
            padding: "1.1rem 2.5rem", borderRadius: "18px",
            background: "linear-gradient(135deg, var(--terracotta) 0%, #d45e1a 100%)",
            color: "#fff", fontWeight: 900, fontSize: "1.1rem",
            textDecoration: "none", boxShadow: "0 12px 36px rgba(181,83,26,0.32)",
            transition: "all 0.25s",
          }}>
            ?? ???? ?? ????
          </Link>
          <Link href="/register-artisan" style={{
            display: "inline-flex", alignItems: "center", gap: "0.6rem",
            padding: "1.1rem 2.5rem", borderRadius: "18px",
            border: "2px solid rgba(181,83,26,0.22)",
            color: "var(--terracotta)", fontWeight: 800, fontSize: "1.05rem",
            textDecoration: "none", background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(8px)", transition: "all 0.25s",
          }}>
            ?? ???? ?????
          </Link>
        </div>
      </header>

      {/* Stats */}
      <section style={{ padding: "3rem 1.5rem", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.25rem" }}>
          {STATS.map((s) => (
            <div key={s.label} style={{
              background: s.featured
                ? "linear-gradient(135deg, var(--terracotta) 0%, #d45e1a 100%)"
                : "rgba(255,255,255,0.85)",
              backdropFilter: "blur(12px)",
              borderRadius: "22px", padding: "2rem",
              textAlign: "center",
              boxShadow: s.featured ? "0 12px 40px rgba(181,83,26,0.28)" : "0 4px 20px rgba(26,18,8,0.07)",
              border: s.featured ? "none" : "1px solid rgba(200,149,108,0.15)",
            }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>{s.icon}</div>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: s.featured ? "#fff" : "var(--terracotta)", marginBottom: "0.3rem" }}>{s.value}</div>
              <div style={{ fontSize: "0.9rem", color: s.featured ? "rgba(255,255,255,0.85)" : "var(--muted)", fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Craft Categories */}
      <section style={{ padding: "3rem 1.5rem", maxWidth: "1100px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "1.7rem", fontWeight: 900, textAlign: "center", color: "var(--dark)", marginBottom: "0.5rem" }}>
          ???? ??? ???????
        </h2>
        <p style={{ textAlign: "center", color: "var(--muted)", marginBottom: "2.5rem" }}>???? ??? ?????? ???? ???????</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem" }}>
          {CRAFTS.map((c) => (
            <Link key={c.label} href={`/search?profession=${encodeURIComponent(c.label)}`} style={{ textDecoration: "none" }}>
              <div style={{
                background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
                borderRadius: "18px", padding: "1.75rem 1rem",
                textAlign: "center", cursor: "pointer",
                border: "1px solid rgba(200,149,108,0.14)",
                boxShadow: "0 4px 16px rgba(26,18,8,0.06)", transition: "all 0.22s",
              }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "translateY(-6px)";
                  el.style.boxShadow = "0 12px 36px rgba(181,83,26,0.15)";
                  el.style.borderColor = "rgba(181,83,26,0.3)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "0 4px 16px rgba(26,18,8,0.06)";
                  el.style.borderColor = "rgba(200,149,108,0.14)";
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>{c.icon}</div>
                <div style={{ fontWeight: 800, color: "var(--dark)", fontSize: "0.95rem" }}>{c.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Artisans */}
      {featuredArtisans.length > 0 && (
        <section style={{ padding: "3rem 1.5rem", maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
            <div>
              <h2 style={{ fontSize: "1.7rem", fontWeight: 900, color: "var(--dark)", marginBottom: "0.3rem" }}>
                ? ?????? ??????
              </h2>
              <p style={{ color: "var(--muted)" }}>?????? ??????? ???????</p>
            </div>
            <Link href="/search" style={{
              padding: "0.7rem 1.5rem", borderRadius: "12px",
              border: "2px solid rgba(181,83,26,0.22)",
              color: "var(--terracotta)", fontWeight: 700, textDecoration: "none", fontSize: "0.9rem",
            }}>??? ???? ?</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.25rem" }}>
            {featuredArtisans.map((a) => {
              const avg = a.reviews.length > 0
                ? (a.reviews.reduce((s, r) => s + r.rating, 0) / a.reviews.length).toFixed(1)
                : null;
              return (
                <Link key={a.id} href={`/artisan/${a.userId}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)",
                    borderRadius: "20px", padding: "1.5rem",
                    boxShadow: a.isPremium ? "0 6px 30px rgba(212,168,67,0.2)" : "0 4px 20px rgba(26,18,8,0.07)",
                    border: a.isPremium ? "2px solid rgba(212,168,67,0.35)" : "1px solid rgba(200,149,108,0.14)",
                    transition: "all 0.22s", cursor: "pointer",
                  }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
                  >
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                      <div style={{
                        width: "56px", height: "56px", borderRadius: "50%", flexShrink: 0,
                        background: a.user.image ? `url(${a.user.image}) center/cover` : "linear-gradient(135deg, var(--terracotta), #d45e1a)",
                        boxShadow: "0 4px 14px rgba(181,83,26,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.5rem",
                      }}>{!a.user.image && "??"}</div>
                      <div>
                        <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                          <div style={{ fontWeight: 900, color: "var(--dark)", fontSize: "1rem" }}>{a.user.name}</div>
                          {a.isVerified && <span style={{ color: "#16a34a", fontSize: "0.8rem" }}>?</span>}
                        </div>
                        <div style={{ color: "var(--terracotta)", fontWeight: 700, fontSize: "0.88rem" }}>{a.profession}</div>
                        <div style={{ color: "var(--muted)", fontSize: "0.82rem" }}>?? {a.wilaya}</div>
                      </div>
                    </div>
                    {avg && (
                      <div style={{ marginTop: "0.9rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <span style={{ color: "#f59e0b" }}>?</span>
                        <span style={{ fontWeight: 800, fontSize: "0.9rem" }}>{avg}</span>
                        <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>({a.reviews.length})</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* CTA for artisans */}
      <section style={{ padding: "4rem 1.5rem", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
        <div style={{
          background: "linear-gradient(135deg, var(--terracotta) 0%, #d45e1a 60%, var(--mid) 100%)",
          borderRadius: "28px", padding: "3.5rem 2.5rem",
          boxShadow: "0 20px 60px rgba(181,83,26,0.3)",
        }}>
          <h2 style={{ fontSize: "1.9rem", fontWeight: 900, color: "#fff", marginBottom: "1rem" }}>
            ??? ????? ???? ???? ??????!
          </h2>
          <p style={{ color: "rgba(255,255,255,0.85)", marginBottom: "2rem", fontSize: "1.05rem", lineHeight: 1.7 }}>
            ???? ??????? ????????. ???? ???? ?????? ????? ?? ???? ??????? ?????
          </p>
          <Link href="/register-artisan" style={{
            display: "inline-flex", alignItems: "center", gap: "0.6rem",
            padding: "1.1rem 3rem", borderRadius: "16px",
            background: "#fff", color: "var(--terracotta)",
            fontWeight: 900, fontSize: "1.1rem", textDecoration: "none",
            boxShadow: "0 8px 28px rgba(0,0,0,0.15)",
          }}>
            ?? ???? ?????? ????
          </Link>
        </div>
      </section>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}
