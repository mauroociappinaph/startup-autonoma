import { PrismaClient } from "@prisma/client";
import PrismaClientPkg from "@prisma/client";

// Lógica de detección de constructor para compatibilidad ESM/CJS en Jest
const PrismaClientConstructor = (() => {
  if (typeof PrismaClientPkg === 'function') return PrismaClientPkg as unknown as typeof PrismaClient;
  const anyPkg = PrismaClientPkg as any;
  if (anyPkg.PrismaClient) return anyPkg.PrismaClient as typeof PrismaClient;
  if (anyPkg.default && anyPkg.default.PrismaClient) return anyPkg.default.PrismaClient as typeof PrismaClient;
  throw new Error("Antigravity Error: No se pudo encontrar el constructor de PrismaClient en el paquete importado.");
})();

/**
 * Singleton del cliente de Prisma para evitar agotar el pool de conexiones en desarrollo.
 * Usamos globalThis para persistencia entre hot-reloads de Node.js.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClientConstructor({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export * from "@prisma/client";
