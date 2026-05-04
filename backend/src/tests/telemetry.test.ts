import { describe, it, expect, afterAll, beforeAll, jest } from '@jest/globals';
import type { Redis } from 'ioredis';

// Mockeamos ioredis para evitar conexiones reales
jest.mock('ioredis', () => {
  const storage: Record<string, Record<string, string>> = {};
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MockRedis = jest.fn().mockImplementation(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const redisInstance: any = {
      pipeline: jest.fn().mockImplementation(() => {
        const pipelineObj: any = {
          rpush: jest.fn().mockImplementation(() => pipelineObj),
          lpush: jest.fn().mockImplementation(() => pipelineObj),
          ltrim: jest.fn().mockImplementation(() => pipelineObj),
          expire: jest.fn().mockImplementation(() => pipelineObj),
          hincrbyfloat: jest.fn().mockImplementation((k, f, v) => {
            redisInstance.hincrbyfloat(k, f, v);
            return pipelineObj;
          }),
          hincrby: jest.fn().mockImplementation((k, f, v) => {
            redisInstance.hincrby(k, f, v);
            return pipelineObj;
          }),
          hset: jest.fn().mockImplementation((k, f, v) => {
            redisInstance.hset(k, f, v);
            return pipelineObj;
          }),
          exec: (jest.fn() as any).mockResolvedValue([]),
        };
        return pipelineObj;
      }),
      hincrbyfloat: jest.fn().mockImplementation((key: any, field: any, value: any) => {
        if (!storage[key]) storage[key] = {};
        const current = parseFloat(storage[key][field] || "0");
        storage[key][field] = (current + value).toString();
        return Promise.resolve(current + value);
      }),
      hincrby: jest.fn().mockImplementation((key: any, field: any, value: any) => {
        if (!storage[key]) storage[key] = {};
        const current = parseInt(storage[key][field] || "0", 10);
        storage[key][field] = (current + value).toString();
        return Promise.resolve(current + value);
      }),
      exec: jest.fn().mockImplementation(() => Promise.resolve([])),
      hgetall: jest.fn().mockImplementation((key: any) => {
        return Promise.resolve(storage[key] || {});
      }),
      set: jest.fn().mockImplementation((key: any, value: any) => {
        storage[key] = { value };
        return Promise.resolve("OK");
      }),
      get: jest.fn().mockImplementation((key: any) => {
        return Promise.resolve(storage[key]?.value || null);
      }),
      publish: jest.fn().mockImplementation(() => Promise.resolve(1)),
      rpush: jest.fn().mockReturnThis(),
      lpush: jest.fn().mockImplementation(() => Promise.resolve(1)),
      ltrim: jest.fn().mockImplementation(() => Promise.resolve("OK")),
      lrange: jest.fn().mockImplementation(() => Promise.resolve([])),
      expire: jest.fn().mockReturnThis(),
      on: jest.fn(),
      quit: jest.fn().mockImplementation(() => Promise.resolve("OK")),
      del: jest.fn().mockImplementation((key: any) => {
        delete storage[key];
        return Promise.resolve(1);
      }),
      keys: (jest.fn() as any).mockImplementation((pattern: string) => {
        const regexStr = pattern
          .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
          .replace(/\?/g, '.')                  // Convert Redis ? to Regex .
          .replace(/\*/g, '.*');               // Convert Redis * to Regex .*
        const regex = new RegExp("^" + regexStr + "$");
        return Promise.resolve(Object.keys(storage).filter(k => regex.test(k)));
      }),
      hset: jest.fn().mockImplementation((key: any, field: any, value: any) => {
        if (!storage[key]) storage[key] = {};
        storage[key][field] = value.toString();
        return Promise.resolve(1);
      })
    };
    return redisInstance;
  });
  return {
    Redis: MockRedis,
    default: MockRedis
  };
});

describe("TelemetryService Integration Tests", () => {
  const projectId = "test-project-" + Date.now();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let telemetryServiceInstance: any;
  let getRedisConnection: () => Redis;
  let closeRedisConnections: () => Promise<void>;
  let redis: Redis;

  beforeAll(async () => {
    // Usamos rutas relativas para evitar problemas de resolución del alias @/ en tsc
    const redisModule = await import("../db/redis.js");
    const telemetryModule = await import("../services/telemetryService.js");
    
    telemetryServiceInstance = new telemetryModule.TelemetryService();
    getRedisConnection = redisModule.getRedisConnection;
    closeRedisConnections = redisModule.closeRedisConnections;
    
    redis = getRedisConnection();
    
    const statsKey = `project:telemetry:stats:${projectId}`;
    await redis.del(statsKey);
  });

  afterAll(async () => {
    const statsKey = `project:telemetry:stats:${projectId}`;
    if (redis) await redis.del(statsKey);
    if (closeRedisConnections) await closeRedisConnections();
  });

  it("should calculate cost correctly for a given model", () => {
    const usage = { prompt: 1000, completion: 500 };
    const model = "gpt-4o"; 
    const cost = (telemetryServiceInstance.constructor as any).calculateCost(usage, model);
    
    expect(cost).toBeGreaterThan(0);
    expect(cost).toBeCloseTo(0.0125, 6);
  });

  it("should persist and aggregate metrics in Redis", async () => {
    const data1 = {
      node: "TEST_NODE_1",
      model: "gpt-4o",
      latency: 500,
      usage: { total: 1500, prompt: 1000, completion: 500 }
    };

    const cost1 = await telemetryServiceInstance.recordMetric(projectId, data1);
    
    const stats1 = await telemetryServiceInstance.getProjectStats(projectId);
    expect(stats1.total_runs).toBe(1);
    expect(stats1.total_tokens).toBe(1500);
    expect(stats1.total_cost_usd).toBeCloseTo(cost1, 6);

    const data2 = {
      node: "TEST_NODE_2",
      model: "gpt-4o",
      latency: 1000,
      usage: { total: 3000, prompt: 2000, completion: 1000 }
    };

    const cost2 = await telemetryServiceInstance.recordMetric(projectId, data2);
    
    const stats2 = await telemetryServiceInstance.getProjectStats(projectId);
    expect(stats2.total_runs).toBe(2);
    expect(stats2.total_tokens).toBe(4500);
    expect(stats2.total_cost_usd).toBeCloseTo(cost1 + cost2, 6);
    expect(stats2.avg_latency_ms).toBe(750); // (500 + 1000) / 2
  });
});

