import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { clientId: session.userId },
          { artisanId: session.userId }
        ]
      },
      include: {
        client: { select: { id: true, name: true, image: true } },
        artisan: { select: { id: true, name: true, image: true, artisanProfile: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 }
      },
      orderBy: { updatedAt: "desc" }
    });

    return NextResponse.json({ success: true, conversations });
  } catch (error: any) {
    console.error("Fetch conversations error:", error);
    return NextResponse.json({ error: "فشل تحميل المحادثات" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { artisanId } = await req.json();
  if (!artisanId) return NextResponse.json({ error: "معرف الحرفي مطلوب" }, { status: 400 });

  if (session.userId === artisanId) {
    return NextResponse.json({ error: "لا يمكنك مراسلة نفسك" }, { status: 400 });
  }

  try {
    const clientId = session.userId;
    
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { clientId, artisanId },
          { clientId: artisanId, artisanId: clientId }
        ]
      },
      include: {
        client: { select: { id: true, name: true, image: true } },
        artisan: { select: { id: true, name: true, image: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 }
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          clientId,
          artisanId
        },
        include: {
          client: { select: { id: true, name: true, image: true } },
          artisan: { select: { id: true, name: true, image: true } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 }
        }
      });
    }

    return NextResponse.json({ success: true, conversation });
  } catch (error: any) {
    console.error("Create conversation error:", error);
    return NextResponse.json({ error: "فشل إنشاء المحادثة" }, { status: 500 });
  }
}
