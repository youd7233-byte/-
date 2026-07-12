import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { wilaya, name } = await req.json();

    if (!wilaya || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Update user's name if changed
    await prisma.user.update({
      where: { id: session.userId },
      data: { name },
    });

    // Create client profile
    const profile = await prisma.clientProfile.create({
      data: {
        userId: session.userId,
        wilaya,
      },
    });

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error("Create Client Profile Error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حفظ البيانات" },
      { status: 500 }
    );
  }
}
