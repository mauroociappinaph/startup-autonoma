/* eslint-disable @typescript-eslint/no-explicit-any */

import { jest, describe, it, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';
import { telemetryService } from '@/services/telemetryService.js';
import { auditService } from '@/services/auditService.js';
import { HumanMessage } from '@langchain/core/messages';

// ioredis is now mocked globally in jest.setup.ts

describe('Business Chief Node', () => {
  let business_chief_node: any;
  let LLMService: any;
  let initialState: any;

  beforeAll(async () => {
    const chiefModule = await import('@/nodes/chiefs/business_chief.js');
    const llmModule = await import('@/services/llmService.js');
    business_chief_node = chiefModule.business_chief_node;
    LLMService = llmModule.LLMService;
  });


  beforeEach(() => {
    initialState = {
      messages: [new HumanMessage('Investigar mercado')],
      active_chief: 'business_chief',
      plan: [],
      completed_steps: [],
      original_prompt: 'Investigar mercado',
      refined_prompt: 'Investigar mercado de agentes',
      executive_summary: '',
      retry_count: 0,
      iteration_count: 0,
      last_recorded_tokens: 0,
      total_cost_usd: 0,
      reasoning: "",
      token_usage: { total: 0, prompt: 0, completion: 0 },
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

  it('debe delegar a researcher cuando falta información', async () => {
    const llmSpy = jest.spyOn(LLMService, 'getStructuredData').mockResolvedValue({
      data: {
        decision: 'delegate_to_researcher',
        reasoning: 'Necesito entender a los competidores antes de actuar.'
      },
      usage: { total: 100, prompt: 50, completion: 50 },
      cost: 0.001,
      latency: 500,
      model: 'test-model'
    });

    const telemetrySpy = jest.spyOn(telemetryService, 'recordMetric').mockResolvedValue(0.001);

    const result = await business_chief_node(initialState);

    expect(result.active_chief).toBe('business_chief');
    expect(result.total_cost_usd).toBe(0.001);
    expect(telemetrySpy).toHaveBeenCalled();
    expect(llmSpy).toHaveBeenCalled();
  });

  it('debe delegar a ai_engine para buscar leads', async () => {
    const llmSpy = jest.spyOn(LLMService, 'getStructuredData').mockResolvedValue({
      data: {
        decision: 'delegate_to_lead_gen',
        reasoning: 'Vamos a buscar leads reales para validar el mercado.'
      },
      usage: { total: 150, prompt: 75, completion: 75 },
      cost: 0.0015,
      latency: 450,
      model: 'test-model'
    });

    const auditSpy = jest.spyOn(auditService, 'logDecision').mockResolvedValue(undefined as any);

    const result = await business_chief_node(initialState);

    expect(result.total_cost_usd).toBe(0.0015);
    expect(auditSpy).toHaveBeenCalled();
    expect(llmSpy).toHaveBeenCalled();
  });
});
