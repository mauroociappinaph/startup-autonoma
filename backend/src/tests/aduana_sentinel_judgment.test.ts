import { aduana_sentinel_node } from "../nodes/mirror/aduana_sentinel_node.js";
import { LLMService } from "../services/llmService.js";
import { AgentStateType } from "@startup/shared";
import { jest } from "@jest/globals";

// Remove jest.mock

describe("Aduana Sentinel - Judgment Day Protocol", () => {
  let mockState: AgentStateType;

  beforeEach(() => {
    jest.clearAllMocks();
    mockState = {
      messages: [],
      original_prompt: "test input",
      // otras propiedades requeridas por el estado
    } as unknown as AgentStateType;
  });

  it("debe bloquear cuando hay consenso positivo (Ambos detectan inyección)", async () => {
    const mockOutput = {
      data: {
        is_injection: true,
        threat_level: "high",
        reasoning: "Injection detected",
        sanitized_input: "test input"
      },
      usage: { inputTokens: 10, outputTokens: 10, totalTokens: 20 },
      latency: 100,
      cost: 0.01,
      model: "test-model"
    };

    jest.spyOn(LLMService, "getStructuredData")
      .mockResolvedValueOnce(mockOutput as any) // Prosecutor
      .mockResolvedValueOnce(mockOutput as any); // Defender

    const updates = await aduana_sentinel_node(mockState);

    expect(LLMService.getStructuredData).toHaveBeenCalledTimes(2);
    expect(updates.is_malicious).toBe(true);
    expect(updates.next_node).toBe("security_blocked");
    expect(updates.security_report).toContain("[Consenso]");
  });

  it("debe permitir cuando hay consenso negativo (Ambos la ven limpia)", async () => {
    const mockOutput = {
      data: {
        is_injection: false,
        threat_level: "none",
        reasoning: "Looks clean",
        sanitized_input: "test input"
      },
      usage: { inputTokens: 10, outputTokens: 10, totalTokens: 20 },
      latency: 100,
      cost: 0.01,
      model: "test-model"
    };

    jest.spyOn(LLMService, "getStructuredData")
      .mockResolvedValueOnce(mockOutput as any) // Prosecutor
      .mockResolvedValueOnce(mockOutput as any); // Defender

    const updates = await aduana_sentinel_node(mockState);

    expect(LLMService.getStructuredData).toHaveBeenCalledTimes(2);
    expect(updates.is_malicious).toBe(false);
    expect(updates.next_node).toBe(undefined);
    expect(updates.security_report).toContain("[Consenso]");
  });

  it("debe usar al Judge para desempatar si hay contradicción (Judge decide bloquear)", async () => {
    const prosecutorOutput = {
      data: {
        is_injection: true,
        threat_level: "high",
        reasoning: "Suspicious pattern",
        sanitized_input: "test input"
      },
      usage: { inputTokens: 10, outputTokens: 10, totalTokens: 20 },
      latency: 100,
      cost: 0.01,
      model: "test-model"
    };

    const defenderOutput = {
      data: {
        is_injection: false,
        threat_level: "none",
        reasoning: "Just a normal question",
        sanitized_input: "test input"
      },
      usage: { inputTokens: 10, outputTokens: 10, totalTokens: 20 },
      latency: 100,
      cost: 0.01,
      model: "test-model"
    };

    const judgeOutput = {
      data: {
        is_injection: true, // Judge desempata bloqueando
        threat_level: "medium",
        reasoning: "I side with prosecutor",
        sanitized_input: "test input"
      },
      usage: { inputTokens: 10, outputTokens: 10, totalTokens: 20 },
      latency: 100,
      cost: 0.01,
      model: "reasoning-model"
    };

    jest.spyOn(LLMService, "getStructuredData")
      .mockResolvedValueOnce(prosecutorOutput as any) // 1ra llamada paralela
      .mockResolvedValueOnce(defenderOutput as any)   // 2da llamada paralela
      .mockResolvedValueOnce(judgeOutput as any);     // 3ra llamada (Judge)

    const updates = await aduana_sentinel_node(mockState);

    expect(LLMService.getStructuredData).toHaveBeenCalledTimes(3);
    expect(updates.is_malicious).toBe(true);
    expect(updates.next_node).toBe("security_blocked");
    expect(updates.security_report).toContain("[Desempate Judge]");
  });

  it("debe usar al Judge para desempatar si hay contradicción (Judge decide permitir)", async () => {
    const prosecutorOutput = {
      data: { is_injection: true, threat_level: "low", reasoning: "Could be malicious", sanitized_input: "test input" },
      latency: 100, cost: 0.01, model: "test-model"
    };
    const defenderOutput = {
      data: { is_injection: false, threat_level: "none", reasoning: "It's safe", sanitized_input: "test input" },
      latency: 100, cost: 0.01, model: "test-model"
    };
    const judgeOutput = {
      data: { is_injection: false, threat_level: "none", reasoning: "I side with defender", sanitized_input: "test input" },
      latency: 100, cost: 0.01, model: "reasoning-model"
    };

    jest.spyOn(LLMService, "getStructuredData")
      .mockResolvedValueOnce(prosecutorOutput as any)
      .mockResolvedValueOnce(defenderOutput as any)
      .mockResolvedValueOnce(judgeOutput as any);

    const updates = await aduana_sentinel_node(mockState);

    expect(LLMService.getStructuredData).toHaveBeenCalledTimes(3);
    expect(updates.is_malicious).toBe(false);
    expect(updates.next_node).toBe(undefined);
    expect(updates.security_report).toContain("[Desempate Judge]");
  });
});
