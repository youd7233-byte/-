import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import ClientMap from "./ClientMap";

const WILAYA_COORDS: Record<string, [number, number]> = {
  "الجزائر": [36.7538, 3.0588],
  "وهران": [35.6987, -0.6308],
  "قسنطينة": [36.365, 6.6147],
  "عنابة": [36.9, 7.7667],
  "باتنة": [35.5555, 6.1741],
  "سطيف": [36.1898, 5.4108],
  "تلمسان": [34.8783, -1.315],
  "البليدة": [36.47, 2.8277],
  "سكيكدة": [36.8762, 5.9056],
  "سيدي بلعباس": [35.1899, -0.6308],
  "بجاية": [36.7559, 5.0843],
  "تيارت": [35.371, 1.3166],
  "تبسة": [34.4025, 8.1114],
  "الشلف": [36.165, 1.3323],
  "الجلفة": [34.6667, 3.25],
  "ورقلة": [31.9493, 5.325],
  // Fallback center for others
  "default": [36.7538, 3.0588]
};

export const dynamic = 'force-dynamic';

export default async function MapPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { clientProfile: true, artisanProfile: true }
  });

  if (!user) redirect("/login");

  // Determine user wilaya
  let userWilaya = "الجزائر";
  if (user.clientProfile?.wilaya) {
    userWilaya = user.clientProfile.wilaya;
  } else if (user.artisanProfile?.wilaya) {
    userWilaya = user.artisanProfile.wilaya;
  }

  const center = WILAYA_COORDS[userWilaya] || WILAYA_COORDS["default"];

  // Fetch artisans
  const artisansDb = await prisma.artisanProfile.findMany({
    include: { user: true }
  });

  const artisans = artisansDb
    .filter(a => a.lat && a.lng)
    .map(a => ({
      id: a.id,
      lat: a.lat!,
      lng: a.lng!,
      profession: a.profession,
      name: a.user.name,
      userId: a.user.id
    }));

  return (
    <div dir="rtl" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      
      <main style={{ flex: 1, position: "relative" }}>
        {/* Search Header Overlay */}
        <div style={{
          position: "absolute", top: "1.5rem", left: "50%", transform: "translateX(-50%)",
          zIndex: 1000, width: "90%", maxWidth: "600px",
          background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)",
          padding: "1rem", borderRadius: "16px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          display: "flex", gap: "0.75rem", alignItems: "center"
        }}>
          <input 
            type="text" 
            placeholder="ابحث عن حرفة أو اسم..."
            style={{
              flex: 1, padding: "0.8rem 1.2rem", border: "1px solid rgba(200,149,108,0.3)",
              borderRadius: "12px", outline: "none", fontFamily: "'Cairo', sans-serif"
            }}
          />
          <button style={{
            padding: "0.8rem 1.5rem", background: "var(--terracotta)", color: "#fff",
            border: "none", borderRadius: "12px", fontFamily: "'Cairo', sans-serif",
            fontWeight: "bold", cursor: "pointer"
          }}>
            بحث
          </button>
        </div>

        <ClientMap artisans={artisans} center={center} />
      </main>
    </div>
  );
}
