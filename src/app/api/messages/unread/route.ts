import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET /api/messages/unread — يُرجع عدد الرسائل غير المقروءة للمستخدم الحالي
export async function GET() {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ count: 0 });

  try {
    const isClient = session.role === "CLIENT";

    // جلب كل محادثات المستخدم
    const conversations = await prisma.conversation.findMany({
      where: isClient ? { clientId: session.userId } : { artisanId: session.userId },
      select: { id: true },
    });

    const conversationIds = conversations.map((c) => c.id);

    // عدّ الرسائل غير المقروءة التي أرسلها الطرف الآخر
    const count = await prisma.message.count({
      where: {
        conversationId: { in: conversationIds },
        senderId: { not: session.userId }, // من الطرف الآخر فقط
        isRead: false,
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Unread count error:", error);
    return NextResponse.json({ count: 0 });
  }
}

// PUT /api/messages/unread — تعيين كل رسائل محادثة معينة كمقروءة
export async function PUT(req: Request) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { conversationId } = await req.json();
    if (!conversationId) return NextResponse.json({ error: "conversationId مطلوب" }, { status: 400 });

    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: session.userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark read error:", error);
    return NextResponse.json({ error: "فشل التحديث" }, { status: 500 });
  }
}
