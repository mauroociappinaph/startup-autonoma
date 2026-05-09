import { jest, describe, beforeEach, it, expect, beforeAll, afterAll } from '@jest/globals';

// ioredis is now mocked globally in jest.setup.ts

describe('CEO Agent Node', () => {
  let ceo_node: any;
  let LLMService: any;
  let telemetryServiceInstance: any;
  let AuditService: any;
  let initialState: any;

  beforeAll(async () => {
    const ceoModule = await import('@/nodes/ceo.js');
    const llmModule = await import('@/services/llmService.js');
    const telemetryModule = await import('@/services/telemetryService.js');
    const auditModule = await import('@/services/auditService.js');

    ceo_node = ceoModule.ceo_node;
    LLMService = llmModule.LLMService;
    telemetryServiceInstance = telemetryModule.telemetryService;
    AuditService = auditModule.AuditService;
  });


  beforeEach(() => {
    initialState = {
      messages: [],
      active_chief: 'software_chief',
      plan: [],
      completed_steps: [],
      original_prompt: 'Test prompt',
      refined_prompt: 'Refined test prompt',
      executive_summary: '',
      retry_count: 0,
      iteration_count: 0,
      token_usage: { total: 0, prompt: 0, completion: 0 },
      last_recorded_tokens: 0,
      total_cost_usd: 0,
      reasoning: "",
      project_context: {
        projectId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test Project',
        workDir: '/tmp/test',
        engramNamespace: 'test-namespace',
        maxTokenBudget: 100000
      }
    };
    jest.clearAllMocks();
  });

  it('debe actualizar el estado correctamente cuando el CEO decide delegar', async () => {
    const llmSpy = jest.spyOn(LLMService, 'getStructuredData').mockResolvedValue({
      data: {
        analysis: 'Análisis de prueba',
        next_step: 'delegate',
        delegated_to: 'business_chief',
        reasoning: 'Necesitamos investigar el mercado'
      },
      usage: { total: 200, prompt: 100, completion: 100 },
      cost: 0.002,
      latency: 1200,
      model: 'test-model'
    });

    const telemetrySpy = jest.spyOn(telemetryServiceInstance, 'recordMetric').mockResolvedValue(0.002);
    const auditSpy = jest.spyOn(AuditService, 'logDecision').mockResolvedValue(undefined);

    const result = await ceo_node(initialState);

    expect(result.executive_summary).toBe('Análisis de prueba');
    expect(result.active_chief).toBe('business_chief');
    expect(result.total_cost_usd).toBe(0.002);
    expect(telemetrySpy).toHaveBeenCalled();
    expect(auditSpy).toHaveBeenCalled();
    expect(llmSpy).toHaveBeenCalled();
  });

  it('debe devolver finish cuando no hay más tareas', async () => {
    const llmSpy = jest.spyOn(LLMService, 'getStructuredData').mockResolvedValue({
      data: {
        analysis: 'Todo listo',
        next_step: 'finish',
        reasoning: 'No hay más tareas'
      },
      usage: { total: 50, prompt: 25, completion: 25 },
      cost: 0.0005,
      latency: 500,
      model: 'test-model'
    });

    const result = await ceo_node(initialState);

    expect(result.active_chief).toBeUndefined();
    expect(result.total_cost_usd).toBe(0.0005);
    expect(llmSpy).toHaveBeenCalled();
  });
});
