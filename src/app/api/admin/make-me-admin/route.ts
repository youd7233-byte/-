import { NextRequest, NextResponse } from "next/server";
import { getSession, createSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: { role: "ADMIN" },
    });

    await createSession(updatedUser.id, "ADMIN", updatedUser.name);

    return NextResponse.json({
      success: true,
      message: "تم تفعيل صلاحيات الأدمن بنجاح! 👑",
      redirect: "/dashboard/admin",
    });
  } catch (error) {
    console.error("Make Admin Error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء الترقية" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
