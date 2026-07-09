import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Enable WebSocket for Neon in Node.js / Vercel serverless environment
if (typeof WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

const prismaClientSingleton = () => {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
export { prisma };

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
