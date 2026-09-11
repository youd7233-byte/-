import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, image: true } },
        artisan: { select: { id: true, name: true, image: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 }
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: "المحادثة غير موجودة" }, { status: 404 });
    }

    // 🔒 IDOR Security Check: Ensure requester is a participant of this conversation
    if (conversation.clientId !== session.userId && conversation.artisanId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بقراءة هذه المحادثة" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json({ success: true, conversation, messages });
  } catch (error: any) {
    console.error("Fetch messages error:", error);
    return NextResponse.json({ error: "فشل تحميل الرسائل" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { content } = await req.json();

  if (!content || !content.trim()) return NextResponse.json({ error: "محتوى الرسالة مطلوب" }, { status: 400 });

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: { clientId: true, artisanId: true }
    });

    if (!conversation) {
      return NextResponse.json({ error: "المحادثة غير موجودة" }, { status: 404 });
    }

    // 🔒 IDOR Security Check: Ensure requester is a participant of this conversation
    if (conversation.clientId !== session.userId && conversation.artisanId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بالإرسال في هذه المحادثة" }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: session.userId,
        content: content.trim()
      }
    });

    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "فشل إرسال الرسالة" }, { status: 500 });
  }
}
