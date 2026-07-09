import "server-only";
import { PrismaClient } from "@prisma/client";
import { neon } from "@neondatabase/serverless";
import { PrismaNeonHTTP } from "@prisma/adapter-neon";

const prismaClientSingleton = () => {
  const urlRaw =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL_DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL;

  const url = urlRaw ? urlRaw.trim() : "";

  if (!url) {
    throw new Error(`No database URL found.`);
  }

  const sql = neon(url);
  const adapter = new PrismaNeonHTTP(sql as any);

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
