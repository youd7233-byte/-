import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, phone, bio, lat, lng } = await req.json();

  try {
    // Update User model (name, phone)
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        name: name || undefined,
        phone: phone || undefined,
      },
    });

    // If artisan, update Profile as well
    if (session.role === "ARTISAN") {
      await prisma.artisanProfile.updateMany({
        where: { userId: session.userId },
        data: {
          bio: bio !== undefined ? bio : undefined,
          lat: lat !== undefined ? lat : undefined,
          lng: lng !== undefined ? lng : undefined,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "فشل تحديث الإعدادات" }, { status: 500 });
  }
}
