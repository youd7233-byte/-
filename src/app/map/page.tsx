import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import PublicMapClient from "./PublicMapClient";

const WILAYA_COORDS: Record<string, [number, number]> = {
  "الجزائر": [36.7538, 3.0588], "وهران": [35.6987, -0.6308],
  "قسنطينة": [36.365, 6.6147], "عنابة": [36.9, 7.7667],
  "باتنة": [35.5555, 6.1741], "سطيف": [36.1898, 5.4108],
  "تلمسان": [34.8783, -1.315], "البليدة": [36.47, 2.8277],
  "سكيكدة": [36.8762, 5.9056], "سيدي بلعباس": [35.1899, -0.6308],
  "بجاية": [36.7559, 5.0843], "تيارت": [35.371, 1.3166],
  "تبسة": [34.4025, 8.1114], "الشلف": [36.165, 1.3323],
  "الجلفة": [34.6667, 3.25], "ورقلة": [31.9493, 5.325],
  "غرداية": [32.49, 3.67], "بشار": [31.6238, -2.2168],
  "تيزي وزو": [36.7169, 4.0456], "بومرداس": [36.7367, 3.4776],
  "تيبازة": [36.5974, 2.4697], "المدية": [36.2639, 2.7539],
  "البويرة": [36.375, 3.9081], "المسيلة": [35.7069, 4.5397],
  "بسكرة": [34.8524, 5.7282], "الأغواط": [33.8003, 2.8654],
  "تندوف": [27.6696, -8.1427], "تمنراست": [22.785, 5.5228],
  "default": [28.0339, 1.6596],
};

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { clientProfile: true, artisanProfile: true },
  });

  if (!user) redirect("/login");

  let userWilaya = "الجزائر";
  if (user.clientProfile?.wilaya) userWilaya = user.clientProfile.wilaya;
  else if (user.artisanProfile?.wilaya) userWilaya = user.artisanProfile.wilaya;

  const center: [number, number] = WILAYA_COORDS[userWilaya] || WILAYA_COORDS["default"];

  const artisansDb = await prisma.artisanProfile.findMany({
    include: { user: true, reviews: true },
  });

  const artisans = artisansDb.map((a) => {
    let lat = a.lat;
    let lng = a.lng;
    if (!lat || !lng) {
      const coords = WILAYA_COORDS[a.wilaya] || WILAYA_COORDS["default"];
      lat = coords[0] + (Math.random() - 0.5) * 0.12;
      lng = coords[1] + (Math.random() - 0.5) * 0.12;
    }
    const avgRating = a.reviews.length > 0
      ? a.reviews.reduce((s, r) => s + r.rating, 0) / a.reviews.length
      : null;
    return {
      id: a.id,
      lat: lat!,
      lng: lng!,
      profession: a.profession,
      name: a.user.name,
      userId: a.user.id,
      wilaya: a.wilaya,
      city: a.city ?? undefined,
      isPremium: a.isPremium,
      isVerified: a.isVerified,
      avgRating,
    };
  });

  const professions = Array.from(new Set(artisans.map((a) => a.profession)));
  const wilayas = Array.from(new Set(artisans.map((a) => a.wilaya).filter(Boolean))) as string[];

  return (
    <div dir="rtl" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--cream)" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <PublicMapClient
          artisans={artisans}
          center={center}
          wilayas={wilayas}
          professions={professions}
          totalCount={artisans.length}
        />
      </main>
    </div>
  );
}
