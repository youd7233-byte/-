import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma");
    // Test the exact query used on the homepage
    const featuredArtisans = await prisma.artisanProfile.findMany({
      where: { OR: [{ isPremium: true }, { isVerified: true }] },
      include: {
        user: { select: { id: true, name: true, image: true } },
        reviews: { select: { rating: true } },
      },
      take: 6,
      orderBy: [{ isPremium: "desc" }, { isVerified: "desc" }],
    });

    return NextResponse.json({ 
      success: true, 
      count: featuredArtisans.length,
      keys: Object.keys(process.env).filter(k => k.startsWith('POSTGRES') || k.startsWith('DATABASE'))
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack,
    });
  }
}
