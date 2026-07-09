import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/session";
import { createSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "البريد الإلكتروني مسجل مسبقاً" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: null, // role is chosen later
      },
    });

    await createSession(user.id, user.role ?? "PENDING", user.name);

    return NextResponse.json({ success: true, redirect: "/choose-role" });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء التسجيل" }, { status: 500 });
  }
}
