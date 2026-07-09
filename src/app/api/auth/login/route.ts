import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "يرجى إدخال البريد وكلمة المرور" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { artisanProfile: true },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }, { status: 401 });
    }

    await createSession(user.id, user.role ?? "PENDING", user.name);

    if (!user.role) {
      return NextResponse.json({ success: true, redirect: "/choose-role" });
    }
    if (user.role === "ARTISAN" && !user.artisanProfile) {
      return NextResponse.json({ success: true, redirect: "/complete-profile" });
    }
    if (user.role === "ARTISAN") {
      return NextResponse.json({ success: true, redirect: "/dashboard" });
    }

    return NextResponse.json({ success: true, redirect: "/" });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء تسجيل الدخول" }, { status: 500 });
  }
}
