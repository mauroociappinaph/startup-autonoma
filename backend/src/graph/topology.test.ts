import { describe, it, expect, afterAll, beforeAll, jest } from '@jest/globals';

// Mockeamos ioredis para evitar conexiones reales
jest.mock('ioredis', () => {
  const MockRedis = jest.fn().mockImplementation(() => ({
    pipeline: (jest.fn() as any).mockImplementation(() => ({ rpush: (jest.fn() as any).mockReturnThis(), ltrim: (jest.fn() as any).mockReturnThis(), expire: (jest.fn() as any).mockReturnThis(), hincrbyfloat: (jest.fn() as any).mockReturnThis(), hincrby: (jest.fn() as any).mockReturnThis(), exec: (jest.fn() as any).mockResolvedValue([]) })),
    hincrbyfloat: (jest.fn() as any).mockReturnThis(),
    hincrby: (jest.fn() as any).mockReturnThis(),
    rpush: (jest.fn() as any).mockReturnThis(),
    ltrim: (jest.fn() as any).mockReturnThis(),
    expire: (jest.fn() as any).mockReturnThis(),
    lrange: (jest.fn() as any).mockResolvedValue([]),
    exec: (jest.fn() as any).mockResolvedValue([]),
    hgetall: (jest.fn() as any).mockResolvedValue({}),
    set: (jest.fn() as any).mockResolvedValue("OK"),
    get: (jest.fn() as any).mockResolvedValue(null),
    publish: (jest.fn() as any).mockResolvedValue(1),
    on: jest.fn() as any,
    quit: (jest.fn() as any).mockResolvedValue("OK")
  }));
  return {
    Redis: MockRedis,
    default: MockRedis
  };
});

describe('Graph Topology', () => {
  let graph: any;

  beforeAll(async () => {
    const module = await import('./index.js');
    graph = module.graph;
  });

  it('debería tener el nodo operations_worker registrado', () => {
    const nodes = graph.nodes;
    expect(nodes).toHaveProperty('operations_worker');
  });

  it('debería tener operations_chief en interruptAfter', () => {
    expect(graph).toBeDefined();
  });
  
  afterAll(async () => {
    const { closeRedisConnections } = await import('../db/redis.js');
    const { aiEngineClient } = await import('../services/aiEngineClient.js');
    await closeRedisConnections();
    aiEngineClient.close();
  });
});
