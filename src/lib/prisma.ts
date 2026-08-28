import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Normalisasi connection string Neon / PostgreSQL untuk libpq compatibility
let connectionString = process.env.DATABASE_URL || "";
if (
  connectionString.includes("sslmode=require") &&
  !connectionString.includes("uselibpqcompat=true")
) {
  const separator = connectionString.includes("?") ? "&" : "?";
  connectionString = `${connectionString}${separator}uselibpqcompat=true`;
}

const adapter = new PrismaPg({
  connectionString,
});

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export type PrismaClientOrTx =
  | PrismaClient
  | Omit<
      PrismaClient,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
    >;
