import { ceo_node } from '@/nodes/ceo.js';
import { LLMService } from '@/services/llmService.js';
import { TelemetryService } from '@/services/telemetryService.js';
import { AuditService } from '@/services/auditService.js';
import { AgentStateType } from '@/types/state.types.js';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';

// Mockeamos los servicios
jest.mock('@/services/llmService.js');
jest.mock('@/services/telemetryService.js');
jest.mock('@/services/auditService.js');

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
      project_context: {
        projectId: 'test-project',
        maxTokenBudget: 100000,
        contextWindow: 128000
      }
    } as any;
    jest.clearAllMocks();
  });

  it('debe actualizar el estado correctamente cuando el CEO decide delegar', async () => {
    (LLMService.getStructuredData as jest.MockedFunction<any>).mockResolvedValue({
      data: {
        analysis: 'Análisis de prueba',
        next_step: 'delegate',
        delegated_to: 'business_chief',
        reasoning: 'Necesitamos investigar el mercado'
      },
      usage: { total: 200, prompt: 100, completion: 100 },
      cost: 0.002,
      latency: 1200
    });

    const result = await ceo_node(initialState);

    expect(result.executive_summary).toBe('Análisis de prueba');
    expect(result.active_chief).toBe('business_chief');
    expect(result.total_cost_usd).toBe(0.002);
    expect(TelemetryService.recordMetric).toHaveBeenCalled();
    expect(AuditService.logDecision).toHaveBeenCalled();
  });

  it('debe devolver finish cuando no hay más tareas', async () => {
    (LLMService.getStructuredData as jest.MockedFunction<any>).mockResolvedValue({
      data: {
        analysis: 'Todo listo',
        next_step: 'finish',
        reasoning: 'No hay más tareas'
      },
      usage: { total: 50, prompt: 25, completion: 25 },
      cost: 0.0005,
      latency: 500
    });

    const result = await ceo_node(initialState);

    expect(result.active_chief).toBeUndefined();
    expect(result.total_cost_usd).toBe(0.0005);
  });
});
