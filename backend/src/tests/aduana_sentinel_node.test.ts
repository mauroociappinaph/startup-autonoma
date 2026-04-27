import { jest, describe, it, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';
import { HumanMessage } from '@langchain/core/messages';
import { AgentStateType } from '@startup/shared';

// Mockeamos ioredis
jest.mock('ioredis', () => {
  const MockRedis = jest.fn().mockImplementation(() => ({
    pipeline: (jest.fn() as any).mockImplementation(() => ({ 
      rpush: (jest.fn() as any).mockReturnThis(), 
      ltrim: (jest.fn() as any).mockReturnThis(), 
      expire: (jest.fn() as any).mockReturnThis(), 
      hincrbyfloat: (jest.fn() as any).mockReturnThis(), 
      hincrby: (jest.fn() as any).mockReturnThis(), 
      exec: (jest.fn() as any).mockResolvedValue([]) 
    })),
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
    lpush: (jest.fn() as any).mockResolvedValue(1),
    on: jest.fn() as any,
    quit: (jest.fn() as any).mockResolvedValue("OK")
  }));
  return {
    Redis: MockRedis,
    default: MockRedis
  };
});

// Para poder trackear las llamadas, lo importamos y espiamos
import { EventBus } from '../services/eventBus.js';

describe('AduanaSentinel Node', () => {
  let aduana_sentinel_node: any;
  let LLMService: any;
  let EventBus: any;
  let initialState: AgentStateType;

  beforeAll(async () => {
    const sentinelModule = await import('../nodes/mirror/aduana_sentinel_node.js');
    const llmModule = await import('../services/llmService.js');
    const ebModule = await import('../services/eventBus.js');
    aduana_sentinel_node = sentinelModule.aduana_sentinel_node;
    LLMService = llmModule.LLMService;
    EventBus = ebModule.EventBus;
  });

  beforeEach(() => {
    initialState = {
      original_prompt: "Hola mundo",
      messages: [],
      trace_id: "test-trace-123",
      iteration_count: 0,
      retry_count: 0,
      token_usage: { total: 0, prompt: 0, completion: 0 },
      executive_summary: ""
    } as any;
    jest.clearAllMocks();
    jest.spyOn(EventBus, 'publish').mockResolvedValue(undefined);
  });

  it('debería emitir SecurityAnalysisEvent cuando el prompt es limpio', async () => {
    jest.spyOn(LLMService, 'getStructuredData').mockResolvedValue({
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
    });

    const result = await aduana_sentinel_node(initialState);

    expect(result.is_malicious).toBe(false);
    expect(result.threat_level).toBe("none");
    expect(EventBus.publish).toHaveBeenCalledWith("test-trace-123", expect.objectContaining({
      type: "SECURITY_ANALYSIS",
      decision: "pass",
      threat_level: "none"
    }));
  });

  it('debería bloquear y emitir SecurityAnalysisEvent cuando se detecta inyección', async () => {
    jest.spyOn(LLMService, 'getStructuredData').mockResolvedValue({
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
    });

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
    
    jest.spyOn(LLMService, 'getStructuredData').mockResolvedValue({
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
    });

    await aduana_sentinel_node(initialState);

    expect(EventBus.publish).toHaveBeenCalledWith("unknown", expect.objectContaining({
      threadId: "unknown"
    }));
  });
});
