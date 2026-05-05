import { jest, describe, it, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';
import { HumanMessage } from '@langchain/core/messages';

// Mockeamos ioredis para evitar conexiones reales
jest.mock('ioredis', () => {
  const MockRedis = jest.fn().mockImplementation(() => ({
    pipeline: (jest.fn() as any).mockImplementation(() => ({ 
      rpush: (jest.fn() as any).mockReturnThis(), 
      ltrim: (jest.fn() as any).mockReturnThis(), 
      expire: (jest.fn() as any).mockReturnThis(), 
      hincrbyfloat: (jest.fn() as any).mockReturnThis(), 
      hincrby: (jest.fn() as any).mockReturnThis(), 
      hset: (jest.fn() as any).mockReturnThis(),
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
    on: jest.fn() as any,
    quit: (jest.fn() as any).mockResolvedValue("OK")
  }));
  return {
    Redis: MockRedis,
    default: MockRedis
  };
});

describe('MirrorAgent Node', () => {
  let mirror_node: any;
  let LLMService: any;
  let initialState: any;

  beforeAll(async () => {
    const mirrorModule = await import('@/nodes/mirror.js');
    const llmModule = await import('@/services/llmService.js');
    mirror_node = mirrorModule.mirror_node;
    LLMService = llmModule.LLMService;
  });

  afterAll(async () => {
    const { closeRedisConnections } = await import('@/db/redis.js');
    await closeRedisConnections();
  });

  beforeEach(() => {
    initialState = {
      original_prompt: "creame una branch y hace un commit",
      refined_prompt: "",
      messages: [new HumanMessage("creame una branch y hace un commit")],
      active_chief: '',
      plan: [],
      completed_steps: [],
      executive_summary: '',
      retry_count: 0,
      iteration_count: 0,
      last_recorded_tokens: 0,
      total_cost_usd: 0,
      reasoning: "",
      token_usage: { total: 0, prompt: 0, completion: 0 }
    };
    jest.clearAllMocks();
  });

  it('debería refinar el prompt y detectar intenciones correctamente', async () => {
    const mockRefined = "Crear una nueva rama de desarrollo y realizar un commit con los cambios actuales.";
    const mockIntentions = ["crear branch", "realizar commit"];

    const llmSpy = jest.spyOn(LLMService, 'getStructuredData').mockResolvedValue({
      data: {
        refined_prompt: "Crear una nueva rama de desarrollo y realizar un commit con los cambios actuales.",
        intentions: ["crear branch", "realizar commit"],
        missing_info: [],
        suggested_next_steps: ["delegar al Software Chief"],
        requires_human_approval: false,
      },
      usage: { total: 100, prompt: 50, completion: 50 },
      cost: 0.001,
      latency: 500,
      model: "glm-5.1"
    });

    const result: any = await mirror_node(initialState);

    expect(result.refined_prompt).toBe(mockRefined);
    expect(result.executive_summary).toContain('Mirror optimizó la petición');
    expect(result.messages?.[0].content).toContain(mockRefined);
    expect(result.messages?.[0].content).toContain(mockIntentions[0]);
    expect(llmSpy).toHaveBeenCalled();
  });

  it('debería fallar si no hay mensaje humano en el historial', async () => {
    initialState.messages = []; // Limpiamos mensajes
    
    // Importamos el logger para espiarlo correctamente ahora que usa Winston
    const loggerModule = await import('@/helpers/logger.js');
    const errorSpy = jest.spyOn(loggerModule.SacredLogger, 'error').mockImplementation(() => {});

    const result = await mirror_node(initialState);

    expect(result.executive_summary).toContain('Error: No hay una instrucción humana');
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
