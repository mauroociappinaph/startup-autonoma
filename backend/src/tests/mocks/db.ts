import { jest } from '@jest/globals';

/**
 * Mock global de la base de datos para evitar la carga de Prisma en tests unitarios.
 * Implementa una versión tipada y extensible para cumplir con la ley "Zero Any".
 */

// En versiones recientes de @types/jest, Mock solo toma un argumento (el tipo de la función)
type MockFn = jest.Mock<(...args: any[]) => Promise<any>>;

interface MockPrismaModel {
  findUnique: MockFn;
  findMany: MockFn;
  create: MockFn;
  update: MockFn;
  delete: MockFn;
  upsert: MockFn;
  count: MockFn;
}

interface MockPrismaClient {
  project: MockPrismaModel;
  auditLog: MockPrismaModel;
  user: MockPrismaModel;
  session: MockPrismaModel;
  $connect: MockFn;
  $disconnect: MockFn;
  $transaction: MockFn;
}

const createMockModel = (): MockPrismaModel => ({
  findUnique: jest.fn(() => Promise.resolve(null)) as MockFn,
  findMany: jest.fn(() => Promise.resolve([])) as MockFn,
  create: jest.fn(() => Promise.resolve({})) as MockFn,
  update: jest.fn(() => Promise.resolve({})) as MockFn,
  delete: jest.fn(() => Promise.resolve({})) as MockFn,
  upsert: jest.fn(() => Promise.resolve({})) as MockFn,
  count: jest.fn(() => Promise.resolve(0)) as MockFn,
});

export const prisma: MockPrismaClient = {
  project: createMockModel(),
  auditLog: createMockModel(),
  user: createMockModel(),
  session: createMockModel(),
  $connect: jest.fn(() => Promise.resolve(undefined)) as MockFn,
  $disconnect: jest.fn(() => Promise.resolve(undefined)) as MockFn,
  $transaction: jest.fn().mockImplementation((callback: unknown) => {
    if (typeof callback === 'function') {
      return (callback as (p: MockPrismaClient) => unknown)(prisma);
    }
    return Promise.resolve([]);
  }) as MockFn,
};

// Helper para resetear todos los mocks de la DB entre tests
export const resetDbMock = () => {
  Object.values(prisma).forEach((model: unknown) => {
    if (typeof model === 'object' && model !== null) {
      Object.values(model).forEach((method: unknown) => {
        if (typeof method === 'function' && 'mockReset' in method) {
          (method as MockFn).mockReset();
        }
      });
    }
  });
};

export default { prisma };
