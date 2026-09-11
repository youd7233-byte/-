import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "يرجى إدخال البريد وكلمة المرور" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // ── Standard User / Admin Login ──
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { artisanProfile: true },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }, { status: 401 });
    }

    const isValid = await verifyPassword(cleanPassword, user.password);

    if (!isValid) {
      return NextResponse.json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }, { status: 401 });
    }

    const userRole = user.role;

    await createSession(user.id, userRole ?? "PENDING", user.name);

    if (userRole === "ADMIN") {
      return NextResponse.json({ success: true, redirect: "/dashboard/admin" });
    }

    if (!userRole) {
      return NextResponse.json({ success: true, redirect: "/choose-role" });
    }
    if (userRole === "ARTISAN" && !user.artisanProfile) {
      return NextResponse.json({ success: true, redirect: "/complete-profile" });
    }
    if (userRole === "ARTISAN" || userRole === "CLIENT") {
      return NextResponse.json({ success: true, redirect: "/dashboard" });
    }

    return NextResponse.json({ success: true, redirect: "/" });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء تسجيل الدخول" }, { status: 500 });
  }
}
