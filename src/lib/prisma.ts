import "server-only";
import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const prismaClientSingleton = () => {
  let url = "";

  // 1. Try to dynamically find ANY valid postgres URL in the runtime environment
  // This bypasses Next.js static bundling and ignores `file:./dev.db` overrides
  const envKeys = Object.keys(process.env);
  for (const key of envKeys) {
    const val = process.env[key];
    if (typeof val === "string" && (val.startsWith("postgres://") || val.startsWith("postgresql://"))) {
      // Prioritize the main Neon database URL
      if (key.includes("DATABASE_URL")) {
        url = val;
        break;
      }
    }
  }

  // 2. If nothing found in the dynamic search, fallback to direct access
  if (!url) {
    url = process.env.POSTGRES_PRISMA_URL_DATABASE_URL || process.env.DATABASE_URL || "";
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
