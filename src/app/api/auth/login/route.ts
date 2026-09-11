import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, hashPassword, createSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "يرجى إدخال البريد وكلمة المرور" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // ── Auto-provision Admin account if admin@hirafi.dz ──
    if (cleanEmail === "admin@hirafi.dz" && cleanPassword === "admin123456") {
      let adminUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
      const hashedAdminPassword = await hashPassword("admin123456");

      if (!adminUser) {
        adminUser = await prisma.user.create({
          data: {
            name: "مدير المنصة",
            email: cleanEmail,
            password: hashedAdminPassword,
            role: "ADMIN",
          },
        });
      } else if (adminUser.role !== "ADMIN") {
        adminUser = await prisma.user.update({
          where: { id: adminUser.id },
          data: { role: "ADMIN", password: hashedAdminPassword },
        });
      }

      await createSession(adminUser.id, "ADMIN", adminUser.name);
      return NextResponse.json({ success: true, redirect: "/dashboard/admin" });
    }

    // ── Standard User Login ──
    let user = await prisma.user.findUnique({
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

    let userRole = user.role;

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
