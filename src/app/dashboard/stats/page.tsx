import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { artisanProfile: { include: { reviews: true } } },
  });

  if (!user || user.role !== "ARTISAN" || !user.artisanProfile) {
    redirect("/dashboard");
  }

  const profile = user.artisanProfile;
  const avgRating = profile.reviews.length > 0
    ? (profile.reviews.reduce((s, r) => s + r.rating, 0) / profile.reviews.length).toFixed(1)
    : 0;

  return (
    <div style={{
      background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)",
      borderRadius: "24px", padding: "2rem",
      boxShadow: "0 8px 40px rgba(26,18,8,0.08)",
      border: "1px solid rgba(200,149,108,0.15)",
    }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--dark)", marginBottom: "1.5rem" }}>
        📈 الإحصائيات
      </h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
        <div style={{ padding: "1.5rem", background: "rgba(212,168,67,0.1)", borderRadius: "16px", border: "1px solid rgba(212,168,67,0.2)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⭐</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 900 }}>{avgRating}</div>
          <div style={{ color: "var(--muted)" }}>متوسط التقييم</div>
        </div>
        
        <div style={{ padding: "1.5rem", background: "rgba(181,83,26,0.1)", borderRadius: "16px", border: "1px solid rgba(181,83,26,0.2)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>💬</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 900 }}>{profile.reviews.length}</div>
          <div style={{ color: "var(--muted)" }}>إجمالي التعليقات</div>
        </div>
      </div>
      
      <div style={{ marginTop: "2rem", padding: "2rem", textAlign: "center", background: "var(--cream)", borderRadius: "16px" }}>
        <p style={{ color: "var(--muted)", fontWeight: 700 }}>قريباً سيتم إضافة المزيد من الإحصائيات التفصيلية (الزيارات، النقرات)...</p>
      </div>
    </div>
  );
}
