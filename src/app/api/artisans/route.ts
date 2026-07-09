import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const profession = searchParams.get("profession") || "";
  const wilaya = searchParams.get("wilaya") || "";
  const search = searchParams.get("search") || "";

  const artisans = await prisma.artisanProfile.findMany({
    where: {
      AND: [
        profession ? { profession: { contains: profession, mode: "insensitive" } } : {},
        wilaya ? { wilaya: { contains: wilaya, mode: "insensitive" } } : {},
        search ? {
          OR: [
            { profession: { contains: search, mode: "insensitive" } },
            { user: { name: { contains: search, mode: "insensitive" } } },
            { wilaya: { contains: search, mode: "insensitive" } },
            { city: { contains: search, mode: "insensitive" } },
          ]
        } : {},
      ],
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
      reviews: { select: { rating: true } },
    },
    take: 50,
    orderBy: [{ isPremium: "desc" }, { isVerified: "desc" }],
  });

  const result = artisans.map((a) => ({
    id: a.id,
    userId: a.userId,
    userName: a.user.name,
    userImage: a.user.image,
    profession: a.profession,
    wilaya: a.wilaya,
    city: a.city,
    bio: a.bio,
    lat: a.lat,
    lng: a.lng,
    isPremium: a.isPremium,
    isVerified: a.isVerified,
    reviewCount: a.reviews.length,
    avgRating: a.reviews.length > 0
      ? parseFloat((a.reviews.reduce((s, r) => s + r.rating, 0) / a.reviews.length).toFixed(1))
      : null,
  }));

  return NextResponse.json({ artisans: result });
}
