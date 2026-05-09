import { jest, describe, it, expect, beforeEach, beforeAll, afterAll } from "@jest/globals";
import { AgentStateType } from "@startup/shared";

import { 
  prepareNodeUpdate, 
  incrementIteration 
} from "../helpers/stateHelper.js";
import { telemetryService } from "../services/telemetryService.js";
import { AuditService } from "../services/auditService.js";


describe("stateHelper", () => {
  let initialState: AgentStateType;

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
    } as unknown as AgentStateType;
    jest.clearAllMocks();
  });

  describe("prepareNodeUpdate", () => {
    it("debe incrementar iteración y acumular costos/tokens correctamente", async () => {
      // Usamos spyOn para evitar problemas de ESM mocks
      const telemetrySpy = jest.spyOn(telemetryService, 'recordMetric').mockResolvedValue(0.002);
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

      expect(update.iteration_count).toBe(1);
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
      expect(update.iteration_count).toBe(1);
      expect(update.total_cost_usd).toBeUndefined();
    });
  });
});
