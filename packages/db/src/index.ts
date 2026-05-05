import PrismaClientPkg from "@prisma/client";

// Lógica de detección de constructor para compatibilidad ESM/CJS en Jest
const PrismaClient = (() => {
  if (typeof PrismaClientPkg === 'function') return PrismaClientPkg;
  const anyPkg = PrismaClientPkg as any;
  if (anyPkg.PrismaClient) return anyPkg.PrismaClient;
  if (anyPkg.default && anyPkg.default.PrismaClient) return anyPkg.default.PrismaClient;
  throw new Error("Antigravity Error: No se pudo encontrar el constructor de PrismaClient en el paquete importado.");
})();

/**
 * Singleton del cliente de Prisma para evitar agotar el pool de conexiones en desarrollo.
 */
const globalForPrisma = global as unknown as { prisma: any };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});


if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export * from "@prisma/client";
