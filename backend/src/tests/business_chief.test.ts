/* eslint-disable @typescript-eslint/no-explicit-any */

import { business_chief_node } from '@/nodes/chiefs/business_chief.js';
import { LLMService } from '@/services/llmService.js';
import { TelemetryService } from '@/services/telemetryService.js';
import { AuditService } from '@/services/auditService.js';
import { AgentStateType } from '@/types/state.types.js';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { HumanMessage } from '@langchain/core/messages';

// Mockeamos los servicios que dejan handles abiertos
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

describe('Business Chief Node', () => {
  let initialState: AgentStateType;

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

    const telemetrySpy = jest.spyOn(TelemetryService, 'recordMetric').mockResolvedValue(0.001);

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

    const auditSpy = jest.spyOn(AuditService, 'logDecision').mockResolvedValue(undefined);

    const result = await business_chief_node(initialState);

    expect(result.total_cost_usd).toBe(0.0015);
    expect(auditSpy).toHaveBeenCalled();
    expect(llmSpy).toHaveBeenCalled();
  });
});
