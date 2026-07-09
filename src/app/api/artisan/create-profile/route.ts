import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { profession, wilaya, city, bio, phone, lat, lng } = await req.json();

  if (!profession || !wilaya) {
    return NextResponse.json({ error: "الحرفة والولاية مطلوبان" }, { status: 400 });
  }

  try {
    // Ensure user role is ARTISAN and update phone
    await prisma.user.update({
      where: { id: session.userId },
      data: { role: "ARTISAN", phone: phone || null },
    });

    // Upsert artisan profile
    const profile = await prisma.artisanProfile.upsert({
      where: { userId: session.userId },
      create: {
        userId: session.userId,
        profession,
        wilaya,
        city: city || null,
        bio: bio || null,
        lat: lat || null,
        lng: lng || null,
      },
      update: {
        profession,
        wilaya,
        city: city || null,
        bio: bio || null,
        lat: lat || null,
        lng: lng || null,
      },
    });

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error("Create profile error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
