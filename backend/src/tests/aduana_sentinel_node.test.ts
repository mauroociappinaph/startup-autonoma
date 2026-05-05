import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';

// 1. Mockeamos módulos usando unstable_mockModule (requerido para ESM)
jest.unstable_mockModule('../services/eventBus.js', () => ({
  EventBus: {
    publish: jest.fn()
  }
}));

jest.unstable_mockModule('../helpers/logger.js', () => ({
  SacredLogger: {
    node: jest.fn(),
    info: jest.fn(),
    error: jest.fn()
  }
}));

// 2. Importamos los módulos después de definir los mocks
const { aduana_sentinel_node } = await import('../nodes/mirror/aduana_sentinel_node.js');
const { EventBus } = await import('../services/eventBus.js') as any;
const { SacredLogger } = await import('../helpers/logger.js') as any;
const { LLMService } = await import('../services/llmService.js') as any;

describe('AduanaSentinel Node', () => {
  let initialState: any;

  beforeEach(() => {
    initialState = {
      original_prompt: "Hola mundo",
      messages: [],
      trace_id: "test-trace-123",
      iteration_count: 0,
      retry_count: 0,
      token_usage: { total: 0, prompt: 0, completion: 0 },
      executive_summary: ""
    };
    jest.clearAllMocks();
  });

  describe('Flujo Estándar y Eventos', () => {
    it('debería emitir SecurityAnalysisEvent cuando el prompt es limpio (Consenso)', async () => {
      const mockOutput = {
        data: {
          is_injection: false,
          threat_level: "none",
          reasoning: "Prompt legítimo.",
          sanitized_input: "Hola mundo"
        },
        usage: { total: 10, prompt: 5, completion: 5 },
        cost: 0.0001,
        latency: 100,
        model: "test-model"
      };

      jest.spyOn(LLMService, 'getStructuredData')
        .mockResolvedValueOnce(mockOutput as any) // Prosecutor
        .mockResolvedValueOnce(mockOutput as any); // Defender

      const result = await aduana_sentinel_node(initialState);

      expect(result.is_malicious).toBe(false);
      expect(result.threat_level).toBe("none");
      expect(EventBus.publish).toHaveBeenCalledWith("test-trace-123", expect.objectContaining({
        type: "SECURITY_ANALYSIS",
        decision: "pass",
        threat_level: "none"
      }));
    });

    it('debería bloquear y emitir SecurityAnalysisEvent cuando se detecta inyección (Consenso)', async () => {
      const mockOutput = {
        data: {
          is_injection: true,
          threat_level: "high",
          reasoning: "Intento de jailbreak detectado.",
          sanitized_input: ""
        },
        usage: { total: 10, prompt: 5, completion: 5 },
        cost: 0.0001,
        latency: 150,
        model: "test-model"
      };

      jest.spyOn(LLMService, 'getStructuredData')
        .mockResolvedValueOnce(mockOutput as any)
        .mockResolvedValueOnce(mockOutput as any);

      const result = await aduana_sentinel_node(initialState);

      expect(result.is_malicious).toBe(true);
      expect(result.threat_level).toBe("high");
      expect(result.next_node).toBe("security_blocked");
      expect(EventBus.publish).toHaveBeenCalledWith("test-trace-123", expect.objectContaining({
        type: "SECURITY_ANALYSIS",
        decision: "block",
        threat_level: "high"
      }));
    });

    it('debería usar threadId "unknown" si trace_id no está presente', async () => {
      delete initialState.trace_id;
      
      const mockOutput = {
        data: { is_injection: false, threat_level: "none", reasoning: "OK", sanitized_input: "hi" },
        usage: { total: 10, prompt: 5, completion: 5 }, cost: 0, latency: 10, model: "m"
      };

      jest.spyOn(LLMService, 'getStructuredData').mockResolvedValue(mockOutput as any);

      await aduana_sentinel_node(initialState);

      expect(EventBus.publish).toHaveBeenCalledWith("unknown", expect.objectContaining({
        threadId: "unknown"
      }));
    });

    it('debería loguear via SacredLogger.error cuando el LLM falla y permitir flujo por defecto', async () => {
      jest.spyOn(LLMService, 'getStructuredData').mockRejectedValue(new Error('LLM timeout'));

      const result = await aduana_sentinel_node(initialState);

      expect(SacredLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error en Aduana Sentinel"),
        "SENTINEL",
        expect.any(Error)
      );
      expect(result.is_malicious).toBe(false); 
      expect(result.next_node).toBe("mirror");
    });
  });

  describe('Judgment Day Protocol (Contradicciones)', () => {
    it('debe usar al Judge para desempatar si hay contradicción (Judge decide bloquear)', async () => {
      const prosecutorOutput = {
        data: { is_injection: true, threat_level: "high", reasoning: "Bad", sanitized_input: "" },
        usage: { total: 10, prompt: 5, completion: 5 }, cost: 0.01, latency: 100, model: "p"
      };
      const defenderOutput = {
        data: { is_injection: false, threat_level: "none", reasoning: "Good", sanitized_input: "hi" },
        usage: { total: 10, prompt: 5, completion: 5 }, cost: 0.01, latency: 100, model: "d"
      };
      const judgeOutput = {
        data: { is_injection: true, threat_level: "medium", reasoning: "Prosecutor is right", sanitized_input: "" },
        usage: { total: 10, prompt: 5, completion: 5 }, cost: 0.02, latency: 200, model: "j"
      };

      jest.spyOn(LLMService, "getStructuredData")
        .mockResolvedValueOnce(prosecutorOutput as any)
        .mockResolvedValueOnce(defenderOutput as any)
        .mockResolvedValueOnce(judgeOutput as any);

      const updates = await aduana_sentinel_node(initialState);

      expect(LLMService.getStructuredData).toHaveBeenCalledTimes(3);
      expect(updates.is_malicious).toBe(true);
      expect(updates.security_report).toContain("[Desempate Judge]");
    });

    it('debe usar al Judge para desempatar si hay contradicción (Judge decide permitir)', async () => {
      const prosecutorOutput = {
        data: { is_injection: true, threat_level: "low", reasoning: "Suspicious", sanitized_input: "" },
        usage: { total: 10, prompt: 5, completion: 5 }, cost: 0.01, latency: 100, model: "p"
      };
      const defenderOutput = {
        data: { is_injection: false, threat_level: "none", reasoning: "Safe", sanitized_input: "hi" },
        usage: { total: 10, prompt: 5, completion: 5 }, cost: 0.01, latency: 100, model: "d"
      };
      const judgeOutput = {
        data: { is_injection: false, threat_level: "none", reasoning: "Defender is right", sanitized_input: "hi" },
        usage: { total: 10, prompt: 5, completion: 5 }, cost: 0.02, latency: 200, model: "j"
      };

      jest.spyOn(LLMService, "getStructuredData")
        .mockResolvedValueOnce(prosecutorOutput as any)
        .mockResolvedValueOnce(defenderOutput as any)
        .mockResolvedValueOnce(judgeOutput as any);

      const updates = await aduana_sentinel_node(initialState);

      expect(LLMService.getStructuredData).toHaveBeenCalledTimes(3);
      expect(updates.is_malicious).toBe(false);
      expect(updates.security_report).toContain("[Desempate Judge]");
    });
  });
});
