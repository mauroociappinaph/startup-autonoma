/* eslint-disable @typescript-eslint/no-explicit-any */

import { ceo_node } from '@/nodes/ceo.js';
import { LLMService } from '@/services/llmService.js';
import { TelemetryService } from '@/services/telemetryService.js';
import { AuditService } from '@/services/auditService.js';
import { AgentStateType } from '@startup/shared';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';

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
    on: jest.fn() as any,
    quit: (jest.fn() as any).mockResolvedValue("OK")
  }));
  return {
    Redis: MockRedis,
    default: MockRedis
  };
});

describe('CEO Agent Node', () => {
  let initialState: AgentStateType;

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

    const telemetrySpy = jest.spyOn(TelemetryService, 'recordMetric').mockResolvedValue(0.002);
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
