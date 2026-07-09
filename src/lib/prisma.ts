import "server-only";
import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const prismaClientSingleton = () => {
  const urlRaw =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL_DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL;

  let url = urlRaw ? urlRaw.trim() : "";

  if (url.includes("channel_binding")) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.delete("channel_binding");
      url = parsed.toString();
    } catch(e) {}
  }

  if (!url) {
    throw new Error(`No database URL found.`);
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
