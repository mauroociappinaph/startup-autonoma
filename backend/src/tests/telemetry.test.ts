/* eslint-disable @typescript-eslint/no-explicit-any */

import { TelemetryService } from "@/services/telemetryService.js";
import { getRedisConnection, closeRedisConnections } from "@/db/redis.js";
import { jest } from '@jest/globals';

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

describe("TelemetryService Integration Tests", () => {
  const projectId = "test-project-" + Date.now();
  const redis = getRedisConnection();

  beforeAll(async () => {
    const statsKey = `project:telemetry:stats:${projectId}`;
    await redis.del(statsKey);
  });

  afterAll(async () => {
    const statsKey = `project:telemetry:stats:${projectId}`;
    await redis.del(statsKey);
    await closeRedisConnections();
  });

  it("should calculate cost correctly for a given model", () => {
    const usage = { prompt: 1000, completion: 500 };
    const model = "gpt-4o"; // Assuming price is $5/$15 per 1M tokens
    const cost = TelemetryService.calculateCost(usage, model);
    
    // Cost calculation logic:
    // input: (1000 / 1,000,000) * 5 = 0.005
    // output: (500 / 1,000,000) * 15 = 0.0075
    // total: 0.0125
    expect(cost).toBeGreaterThan(0);
  });

  it("should persist and aggregate metrics in Redis", async () => {
    const data1 = {
      node: "TEST_NODE_1",
      model: "gpt-4o",
      latency: 500,
      usage: { total: 1500, prompt: 1000, completion: 500 }
    };

    const cost1 = await TelemetryService.recordMetric(projectId, data1);
    
    const stats1 = await TelemetryService.getProjectStats(projectId);
    expect(stats1.total_runs).toBe(1);
    expect(stats1.total_tokens).toBe(1500);
    expect(stats1.total_cost_usd).toBeCloseTo(cost1, 6);

    const data2 = {
      node: "TEST_NODE_2",
      model: "gpt-4o",
      latency: 1000,
      usage: { total: 3000, prompt: 2000, completion: 1000 }
    };

    const cost2 = await TelemetryService.recordMetric(projectId, data2);
    
    const stats2 = await TelemetryService.getProjectStats(projectId);
    expect(stats2.total_runs).toBe(2);
    expect(stats2.total_tokens).toBe(4500);
    expect(stats2.total_cost_usd).toBeCloseTo(cost1 + cost2, 6);
    expect(stats2.avg_latency_ms).toBe(750); // (500 + 1000) / 2
  });
});
