import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// GET - list my portfolios
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { artisanProfile: { include: { portfolios: { orderBy: { createdAt: "desc" } } } } },
  });

  if (!user?.artisanProfile) return NextResponse.json({ portfolios: [] });
  return NextResponse.json({ portfolios: user.artisanProfile.portfolios });
}

// POST - add portfolio image
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { artisanProfile: true },
  });

  if (!user?.artisanProfile) {
    return NextResponse.json({ error: "لا يوجد ملف حرفي" }, { status: 400 });
  }

  const body = await req.json();
  const { imageUrl, description } = body;

  if (!imageUrl) {
    return NextResponse.json({ error: "رابط الصورة مطلوب" }, { status: 400 });
  }

  const portfolio = await prisma.portfolio.create({
    data: {
      artisanProfileId: user.artisanProfile.id,
      imageUrl,
      description: description || null,
    },
  });

  return NextResponse.json({ portfolio }, { status: 201 });
}

// DELETE - remove portfolio image
export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID مطلوب" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { artisanProfile: true },
  });

  if (!user?.artisanProfile) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  // Ensure the portfolio belongs to this artisan
  const portfolio = await prisma.portfolio.findUnique({ where: { id } });
  if (!portfolio || portfolio.artisanProfileId !== user.artisanProfile.id) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  await prisma.portfolio.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
