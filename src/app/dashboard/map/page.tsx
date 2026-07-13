import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import DashboardMapClient from "./DashboardMapClient";

export const dynamic = "force-dynamic";

const WILAYAS = [
  "الجزائر","وهران","قسنطينة","عنابة","باتنة","سطيف","تلمسان","البليدة",
  "سيدي بلعباس","بجاية","تيارت","تبسة","الشلف","الجلفة","ورقلة","بشار",
  "غرداية","تيزي وزو","المدية","معسكر","سعيدة","عين الدفلى","البويرة",
  "بومرداس","تيبازة","المسيلة","خنشلة","سكيكدة","جيجل","برج بوعريريج",
  "الوادي","الطارف","قالمة","سوق أهراس","أم البواقي","قسنطينة","خنشلة",
  "تندوف","النعامة","بسكرة","الأغواط","الوادي","إليزي","تمنراست","أدرار",
];

const WILAYA_COORDS: Record<string, [number, number]> = {
  "الجزائر": [36.7538, 3.0588], "وهران": [35.6987, -0.6308],
  "قسنطينة": [36.365, 6.6147], "عنابة": [36.9, 7.7667],
  "باتنة": [35.5555, 6.1741], "سطيف": [36.1898, 5.4108],
  "تلمسان": [34.8783, -1.315], "البليدة": [36.47, 2.8277],
  "بجاية": [36.7559, 5.0843], "تيارت": [35.371, 1.3166],
  "الجلفة": [34.6667, 3.25], "ورقلة": [31.9493, 5.325],
  "غرداية": [32.49, 3.67], "تيزي وزو": [36.7169, 4.0456],
  "بشار": [31.6238, -2.2168], "تندوف": [27.6696, -8.1427],
  "تمنراست": [22.785, 5.5228], "أدرار": [27.874, -0.2944],
  "المسيلة": [35.7069, 4.5397], "بسكرة": [34.8524, 5.7282],
  "الأغواط": [33.8003, 2.8654], "سكيكدة": [36.8762, 5.9056],
  "جيجل": [36.8212, 5.7664], "بومرداس": [36.7367, 3.4776],
  "تيبازة": [36.5974, 2.4697], "البويرة": [36.375, 3.9081],
  "معسكر": [35.3982, 0.1403], "سعيدة": [34.8396, 0.1536],
  "الشلف": [36.165, 1.3323], "المدية": [36.2639, 2.7539],
  "عين الدفلى": [36.2639, 1.9661], "تبسة": [35.404, 8.1232],
  "سوق أهراس": [36.2834, 7.9536], "الطارف": [36.7673, 8.3145],
  "قالمة": [36.4635, 7.4368], "أم البواقي": [35.8768, 7.1134],
  "برج بوعريريج": [36.074, 4.7626], "الوادي": [33.3683, 6.8671],
  "خنشلة": [35.4361, 7.1457], "سيدي بلعباس": [35.1899, -0.6308],
  "إليزي": [26.4833, 8.4833], "النعامة": [33.2667, -0.3167],
};

export default async function DashboardMapPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const artisansDb = await prisma.artisanProfile.findMany({
    include: {
      user: true,
      reviews: true,
    },
  });

  const artisans = artisansDb.map((a) => {
    let lat = a.lat;
    let lng = a.lng;
    if (!lat || !lng) {
      const coords = WILAYA_COORDS[a.wilaya] || [36.7538, 3.0588];
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

  // Stats
  const totalArtisans = artisans.length;
  const totalReviews = artisansDb.reduce((s, a) => s + a.reviews.length, 0);
  const overallRating = totalReviews > 0
    ? (artisansDb.reduce((s, a) => s + a.reviews.reduce((rs, r) => rs + r.rating, 0), 0) / totalReviews).toFixed(1)
    : "4.8";
  
  // Wilaya counts
  const wilayaCounts: Record<string, number> = {};
  artisans.forEach((a) => {
    if (a.wilaya) wilayaCounts[a.wilaya] = (wilayaCounts[a.wilaya] || 0) + 1;
  });
  const activeWilayas = Object.keys(wilayaCounts).length;

  // Top artisans by rating
  const topArtisans = [...artisans]
    .filter((a) => a.avgRating !== null)
    .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
    .slice(0, 6);

  // Professions list
  const professions = Array.from(new Set(artisans.map((a) => a.profession)));

  const userDb = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { artisanProfile: true, clientProfile: true },
  });
  const userWilaya = userDb?.artisanProfile?.wilaya || userDb?.clientProfile?.wilaya || "الجزائر";
  const center: [number, number] = WILAYA_COORDS[userWilaya] || [28.0339, 1.6596];

  return (
    <DashboardMapClient
      artisans={artisans}
      center={center}
      stats={{
        totalArtisans,
        activeWilayas,
        overallRating: Number(overallRating),
        totalReviews,
      }}
      topArtisans={topArtisans}
      wilayas={WILAYAS}
      professions={professions}
    />
  );
}
