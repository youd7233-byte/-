import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma");
    // Just try to instantiate it (which runs prismaClientSingleton)
    return NextResponse.json({ 
      success: true, 
      keys: Object.keys(process.env).filter(k => k.startsWith('POSTGRES') || k.startsWith('DATABASE'))
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      keys: Object.keys(process.env).filter(k => k.startsWith('POSTGRES') || k.startsWith('DATABASE'))
    });
  }
}
