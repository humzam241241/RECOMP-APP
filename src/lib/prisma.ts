import { PrismaClient } from "@prisma/client";

// Sanitize DATABASE_URL to remove hidden characters (\r, leading/trailing spaces)
const sanitizedDatabaseUrl = process.env.DATABASE_URL?.trim().replace(/\r/g, "");

if (sanitizedDatabaseUrl && !sanitizedDatabaseUrl.startsWith("postgresql://") && !sanitizedDatabaseUrl.startsWith("postgres://")) {
  console.error("[PRISMA][FATAL] Invalid DATABASE_URL detected at runtime. Does not start with postgresql://");
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: sanitizedDatabaseUrl,
      },
    },
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
