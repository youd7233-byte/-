import "server-only";
import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const prismaClientSingleton = () => {
  // Try multiple env var names (Vercel Neon integration uses different names)
  const urlRaw =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL_DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL;

  const url = urlRaw ? urlRaw.trim() : "";

  if (!url) {
    throw new Error(
      `No database URL found. Tried: DATABASE_URL, POSTGRES_PRISMA_URL_DATABASE_URL, POSTGRES_URL, POSTGRES_PRISMA_URL. ` +
      `Available env keys starting with POSTGRES/DATABASE: ${Object.keys(process.env).filter(k => k.startsWith('POSTGRES') || k.startsWith('DATABASE')).join(', ')}`
    );
  }

  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaNeon(pool as any);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
export { prisma };

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
