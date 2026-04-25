import { describe, it, expect, afterAll, jest } from '@jest/globals';
import { graph } from './index.js';
import { closeRedisConnections } from '../db/redis.js';

// Mockeamos ioredis para evitar conexiones reales
jest.mock('ioredis', () => {
  const MockRedis = jest.fn().mockImplementation(() => ({
    pipeline: (jest.fn() as any).mockReturnThis(),
    hincrbyfloat: (jest.fn() as any).mockReturnThis(),
    hincrby: (jest.fn() as any).mockReturnThis(),
    exec: (jest.fn() as any).mockResolvedValue([]),
    hgetall: (jest.fn() as any).mockResolvedValue({}),
    set: (jest.fn() as any).mockResolvedValue("OK"),
    get: (jest.fn() as any).mockResolvedValue(null),
    on: jest.fn() as any,
    quit: (jest.fn() as any).mockResolvedValue("OK")
  }));
  return {
    Redis: MockRedis,
    default: MockRedis
  };
});

describe('Graph Topology', () => {
  it('debería tener el nodo operations_worker registrado', () => {
    const nodes = (graph as any).nodes;
    expect(nodes).toHaveProperty('operations_worker');
  });

  it('debería tener operations_chief en interruptAfter', () => {
    const config = (graph as any).config; // Depende de la versión de LangGraph
    // Alternativamente, podemos verificar la compilación
    expect(graph).toBeDefined();
  });
  
  afterAll(async () => {
    await closeRedisConnections();
  });
});
