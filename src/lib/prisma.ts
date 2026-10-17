import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Normalisasi connection string Neon / PostgreSQL untuk libpq compatibility
let connectionString = process.env.DATABASE_URL || "";
if (
  connectionString.includes("sslmode=require") &&
  !connectionString.includes("uselibpqcompat=true")
) {
  const separator = connectionString.includes("?") ? "&" : "?";
  connectionString = `${connectionString}${separator}uselibpqcompat=true`;
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

// Singleton Pool dari pg agar tidak terjadi connection leak saat HMR / dev reload
const pool =
  globalForPrisma.pgPool ||
  new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 10000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  });

// Tangkap idle client error agar tidak menjadi unhandled rejection yang memutus pool
pool.on("error", (err) => {
  console.warn("[PG_POOL_IDLE_ERROR]", err.message);
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pgPool = pool;
}

const adapter = new PrismaPg(pool);

const basePrisma = new PrismaClient({ adapter });

// Auto-retry transient connection drops (seperti Neon scale-to-zero wake up atau idle connection reset oleh PgBouncer)
const extendedPrisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        try {
          return await query(args);
        } catch (error: any) {
          const msg = error?.message || "";
          if (
            msg.includes("Server has closed the connection") ||
            msg.includes("closed the connection") ||
            msg.includes("ECONNRESET") ||
            msg.includes("Connection terminated")
          ) {
            console.warn(
              `[PRISMA_RETRY] Retrying ${String(model)}.${String(operation)} after connection drop...`
            );
            return await query(args);
          }
          throw error;
        }
      },
    },
  },
});

export const prisma = (globalForPrisma.prisma || extendedPrisma) as unknown as PrismaClient;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export type PrismaClientOrTx =
  | PrismaClient
  | Omit<
      PrismaClient,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
    >;
