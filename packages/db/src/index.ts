import { PrismaClient } from "@prisma/client";

// Declaramos el tipo para el objeto global de forma segura
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

/**
 * Singleton del cliente de Prisma.
 * En entornos de no-producción, se persiste en el objeto global para sobrevivir
 * a los reinicios de Hot Reload (tsx/next.js).
 */
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export * from "@prisma/client";
