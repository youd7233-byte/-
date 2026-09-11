import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const adminEmail = "admin@hirafi.dz";
    const adminPasswordRaw = "admin123456";

    let user = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    const hashedPassword = await hashPassword(adminPasswordRaw);

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: "مدير المنصة",
          email: adminEmail,
          password: hashedPassword,
          role: "ADMIN",
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          role: "ADMIN",
          password: hashedPassword,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "تم إعداد حساب الأدمن بنجاح! 👑",
      credentials: {
        email: adminEmail,
        password: adminPasswordRaw,
      },
    });
  } catch (error) {
    console.error("Admin setup error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء إعداد الحساب" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
