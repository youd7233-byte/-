import "server-only";
import { PrismaClient } from "@prisma/client";

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

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
export { prisma };

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
