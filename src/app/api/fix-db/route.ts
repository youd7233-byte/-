import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ALTER COLUMN "phone" DROP NOT NULL;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;`);
    
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "googleId" TEXT UNIQUE;`);
    } catch (e) {
      console.log("googleId column might already exist", e);
    }

    return NextResponse.json({ success: true, message: "Database schema fixed!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
