import { jest, describe, it, expect, beforeEach, beforeAll, afterAll } from "@jest/globals";

// Mockeamos ioredis para evitar conexiones reales
jest.mock('ioredis', () => {
  const MockRedis = jest.fn().mockImplementation(() => ({
    pipeline: (jest.fn() as any).mockReturnThis(),
    hincrbyfloat: (jest.fn() as any).mockReturnThis(),
    hincrby: (jest.fn() as any).mockReturnThis(),
    exec: (jest.fn() as any).mockResolvedValue([]),
    hgetall: (jest.fn() as any).mockResolvedValue({}),
    publish: (jest.fn() as any).mockResolvedValue(1),
    on: jest.fn() as any,
    quit: (jest.fn() as any).mockResolvedValue("OK")
  }));
  return {
    Redis: MockRedis,
    default: MockRedis
  };
});

describe("stateHelper", () => {
  let prepareNodeUpdate: any;
  let incrementIteration: any;
  let TelemetryService: any;
  let AuditService: any;
  let initialState: any;

  beforeAll(async () => {
    const module = await import("../helpers/stateHelper.js");
    const telemetryModule = await import("../services/telemetryService.js");
    const auditModule = await import("../services/auditService.js");
    
    prepareNodeUpdate = module.prepareNodeUpdate;
    incrementIteration = module.incrementIteration;
    TelemetryService = telemetryModule.TelemetryService;
    AuditService = auditModule.AuditService;
  });

  afterAll(async () => {
    const { closeRedisConnections } = await import("../db/redis.js");
    await closeRedisConnections();
  });

  beforeEach(() => {
    initialState = {
      messages: [],
      iteration_count: 5,
      total_cost_usd: 0.01,
      token_usage: { total: 1000, prompt: 500, completion: 500 },
      executive_summary: "Initial",
      retry_count: 0,
      plan: [],
      completed_steps: [],
      original_prompt: "",
      refined_prompt: ""
    };
    jest.clearAllMocks();
  });

  describe("prepareNodeUpdate", () => {
    it("debe incrementar iteración y acumular costos/tokens correctamente", async () => {
      // Usamos spyOn para evitar problemas de ESM mocks
      const telemetrySpy = jest.spyOn(TelemetryService, 'recordMetric').mockResolvedValue(0.002);
      const auditSpy = jest.spyOn(AuditService, 'logDecision').mockResolvedValue(undefined);

      const metadata = {
        nodeName: "TestNode",
        model: "test-model",
        usage: { total: 200, prompt: 100, completion: 100 },
        latency: 500,
        cost: 0.002,
        reasoning: "Test reasoning",
        decision: "test-decision"
      };

      const update = await prepareNodeUpdate(initialState, metadata);

      expect(update.iteration_count).toBe(6);
      expect(update.total_cost_usd).toBe(0.012);
      expect(update.token_usage?.total).toBe(1200);
      expect(update.reasoning).toBe("Test reasoning");
      
      expect(telemetrySpy).toHaveBeenCalled();
      expect(auditSpy).toHaveBeenCalled();
    });
  });

  describe("incrementIteration", () => {
    it("debe solo incrementar el contador", () => {
      const update = incrementIteration(initialState);
      expect(update.iteration_count).toBe(6);
      expect(update.total_cost_usd).toBeUndefined();
    });
  });
});
