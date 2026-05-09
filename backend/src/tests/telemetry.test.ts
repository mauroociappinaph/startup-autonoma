import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import type { Redis } from 'ioredis';
import { mockRedis } from './mocks/redis.js';

describe("TelemetryService Integration Tests", () => {
  const projectId = "test-project-" + Date.now();
  let telemetryServiceInstance: any; // Mantenemos any temporalmente para la instancia pero limpiamos el resto
  let getRedisConnection: () => Redis;
  let redis: Redis;

  beforeAll(async () => {
    // Reset del mock centralizado
    mockRedis.flushall();

    const redisModule = await import("../db/redis.js");
    const telemetryModule = await import("../services/telemetryService.js");
    
    telemetryServiceInstance = new telemetryModule.TelemetryService();
    getRedisConnection = redisModule.getRedisConnection;
    
    redis = getRedisConnection();
    
    const statsKey = `project:telemetry:stats:${projectId}`;
    await redis.del(statsKey);
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

