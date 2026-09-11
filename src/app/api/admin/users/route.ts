import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

async function verifyAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    // Check if user is actually admin in DB in case session role was cached
    if (session?.userId) {
      const dbUser = await prisma.user.findUnique({ where: { id: session.userId } });
      if (dbUser?.role === "ADMIN") return session;
    }
    return null;
  }
  return session;
}

export async function GET(req: NextRequest) {
  try {
    const adminSession = await verifyAdmin();
    if (!adminSession) {
      return NextResponse.json({ error: "غير مصرح - صلاحيات المشرف مطلوبة" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        artisanProfile: {
          include: {
            reviews: true,
          },
        },
        clientProfile: true,
      },
    });

    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { id: true, name: true, email: true } },
        artisanProfile: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    // Overview Stats
    const totalUsers = users.length;
    const totalArtisans = users.filter((u) => u.role === "ARTISAN").length;
    const totalClients = users.filter((u) => u.role === "CLIENT").length;
    const verifiedArtisans = users.filter((u) => u.artisanProfile?.isVerified).length;
    const premiumArtisans = users.filter((u) => u.artisanProfile?.isPremium).length;
    const totalReviews = reviews.length;

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalArtisans,
        totalClients,
        verifiedArtisans,
        premiumArtisans,
        totalReviews,
      },
      users,
      reviews,
    });
  } catch (error) {
    console.error("Admin Users GET error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء جلب البيانات" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const adminSession = await verifyAdmin();
    if (!adminSession) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { userId, action, role } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "المستخدم غير محدد" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { artisanProfile: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 44 });
    }

    if (action === "toggleVerify") {
      if (!targetUser.artisanProfile) {
        return NextResponse.json({ error: "المستخدم ليس لديه ملف حرفي" }, { status: 400 });
      }
      await prisma.artisanProfile.update({
        where: { userId },
        data: { isVerified: !targetUser.artisanProfile.isVerified },
      });
      return NextResponse.json({ success: true, message: "تم تغيير حالة التوثيق بنجاح" });
    }

    if (action === "togglePremium") {
      if (!targetUser.artisanProfile) {
        return NextResponse.json({ error: "المستخدم ليس لديه ملف حرفي" }, { status: 400 });
      }
      await prisma.artisanProfile.update({
        where: { userId },
        data: { isPremium: !targetUser.artisanProfile.isPremium },
      });
      return NextResponse.json({ success: true, message: "تم تغيير حالة الحساب المميز بنجاح" });
    }

    if (action === "changeRole" && role) {
      await prisma.user.update({
        where: { id: userId },
        data: { role },
      });
      return NextResponse.json({ success: true, message: `تم تغيير دور المستخدم إلى ${role}` });
    }

    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  } catch (error) {
    console.error("Admin Users PUT error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء التحديث" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const adminSession = await verifyAdmin();
    if (!adminSession) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "معرف المستخدم مطلوب" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true, message: "تم حذف الحساب بنجاح" });
  } catch (error) {
    console.error("Admin Users DELETE error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء الحذف" }, { status: 500 });
  }
}
