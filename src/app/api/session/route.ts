import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    userId: session.userId,
    user: {
      id: session.userId,
      name: session.name,
      role: session.role,
    },
  });
}
