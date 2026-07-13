import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "يجب تسجيل الدخول أولاً" }, { status: 401 });
    }

    const body = await req.json();
    const { artisanProfileId, rating, comment } = body;

    if (!artisanProfileId || !rating) {
      return NextResponse.json({ error: "بيانات التقييم غير مكتملة" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { artisanProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    // Check if the user is an artisan rating themselves
    if (user.artisanProfile && user.artisanProfile.id === artisanProfileId) {
      return NextResponse.json({ error: "لا يمكنك تقييم نفسك" }, { status: 400 });
    }

    // Save review
    const review = await prisma.review.create({
      data: {
        clientId: user.id,
        artisanProfileId,
        rating,
        comment: comment || null,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("Review Error:", error);
    return NextResponse.json({ error: "حدث خطأ داخلي" }, { status: 500 });
  }
}
