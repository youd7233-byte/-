import { prisma } from "@/lib/prisma";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div style={{ height: "600px", background: "#e5e7eb", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}>جاري تحميل الخريطة...</div>
});

export const dynamicParams = true;
export const revalidate = 0; // Don't cache so map is always updated

export default async function MapDashboardPage() {
  const artisans = await prisma.artisanProfile.findMany({
    where: { lat: { not: null }, lng: { not: null } },
    include: { user: true }
  });

  const formattedArtisans = artisans.map(a => ({
    id: a.id,
    lat: a.lat!,
    lng: a.lng!,
    profession: a.profession,
    name: a.user.name,
    userId: a.userId
  }));

  return (
    <div>
      <div style={{
        background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)",
        borderRadius: "24px", padding: "1.5rem 2.5rem",
        boxShadow: "0 8px 40px rgba(26,18,8,0.08)",
        border: "1px solid rgba(200,149,108,0.15)",
        marginBottom: "1.5rem",
        display: "flex", alignItems: "center", gap: "1rem"
      }}>
        <span style={{ fontSize: "2rem" }}>🗺️</span>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--dark)", marginBottom: "0.25rem" }}>
            خريطة الحرفيين
          </h1>
          <p style={{ color: "var(--muted)", fontWeight: 600, fontSize: "0.9rem" }}>
            استكشف الحرفيين المتاحين في منطقتك
          </p>
        </div>
      </div>

      <div style={{ height: "600px", borderRadius: "24px", overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.1)" }}>
        <Map artisans={formattedArtisans} interactive={true} />
      </div>
    </div>
  );
}
