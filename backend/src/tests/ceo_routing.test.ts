import { jest, describe, it, expect, afterEach, beforeAll, afterAll } from '@jest/globals';
import { HumanMessage } from '@langchain/core/messages';

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
    publish: (jest.fn() as any).mockResolvedValue(1),
    on: jest.fn() as any,
    quit: (jest.fn() as any).mockResolvedValue("OK")
  }));
  return {
    Redis: MockRedis,
    default: MockRedis
  };
});

describe('CEO Node Routing', () => {
  let ceo_node: any;
  let LLMService: any;

  beforeAll(async () => {
    const ceoModule = await import('@/nodes/ceo.js');
    const llmModule = await import('@/services/llmService.js');
    ceo_node = ceoModule.ceo_node;
    LLMService = llmModule.LLMService;
  });

  afterAll(async () => {
    const { closeRedisConnections } = await import('@/db/redis.js');
    await closeRedisConnections();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('debería delegar al Operations Chief para consultas de infraestructura', async () => {
    const mockState: any = {
      messages: [new HumanMessage('¿Cómo están los contenedores de docker?')],
    };

    jest.spyOn(LLMService, 'getStructuredData').mockResolvedValue({
      data: {
        reasoning: 'El usuario pregunta por el estado de docker',
        analysis: 'Necesito consultar a operaciones',
        next_step: 'delegate',
        delegated_to: 'operations_chief',
        task_description: 'Check docker status',
        is_complete: false
      },
      usage: {} as any,
      cost: 0,
      latency: 100,
      model: 'test-model'
    });

    const result = await ceo_node(mockState);

    expect(result.active_chief).toBe('operations_chief');
  });
});
