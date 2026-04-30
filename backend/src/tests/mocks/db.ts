import { jest } from '@jest/globals';

/**
 * Mock global de la base de datos para evitar la carga de Prisma en tests unitarios.
 * Esto resuelve el error 'PrismaClient is not a constructor' y acelera la ejecución.
 */
export const prisma = {
  project: {
    findUnique: (jest.fn() as any).mockResolvedValue(null),
    create: (jest.fn() as any).mockResolvedValue({}),
    update: (jest.fn() as any).mockResolvedValue({}),
  },
  auditLog: {
    create: (jest.fn() as any).mockResolvedValue({}),
    findMany: (jest.fn() as any).mockResolvedValue([]),
  },
  $connect: (jest.fn() as any).mockResolvedValue(undefined),
  $disconnect: (jest.fn() as any).mockResolvedValue(undefined),
};

export default { prisma };
