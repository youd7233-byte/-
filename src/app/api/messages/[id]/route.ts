import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json({ success: true, messages });
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

  if (!content) return NextResponse.json({ error: "محتوى الرسالة مطلوب" }, { status: 400 });

  try {
    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: session.userId,
        content
      }
    });

    // Update conversation updatedAt
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
