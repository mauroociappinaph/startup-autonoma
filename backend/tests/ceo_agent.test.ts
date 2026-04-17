import { ceo_node } from '@/nodes/ceo.js';
import { LLMService } from '@/services/llmService.js';
import { AgentStateType } from '@/types/state.types.js';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';

// Mockeamos el servicio de LLM
jest.mock('@/services/llmService.js');

describe('CEO Agent Node', () => {
  let initialState: AgentStateType;

  beforeEach(() => {
    initialState = {
      messages: [],
      active_chief: 'software_chief', // Inicializamos con un valor válido
      plan: [],
      completed_steps: [],
      original_prompt: '',
      refined_prompt: '',
      executive_summary: '',
      status: 'planning',
      retry_count: 0,
      trace_id: 'test-ceo-trace',
      metadata: {},
      results: [],
      feedback: []
    };
    jest.clearAllMocks();
  });

  it('debe actualizar el plan con el jefe correspondiente cuando el CEO decide delegar', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (LLMService.getStructuredData as jest.MockedFunction<any>).mockResolvedValue({
      analysis: 'Análisis de prueba',
      next_step: 'delegate',
      delegated_to: 'business_chief',
      reasoning: 'Necesitamos investigar el mercado',
      is_complete: false
    });

    const result = await ceo_node(initialState);

    expect(result.executive_summary).toBe('Análisis de prueba');
    expect(result.plan).toContain('business_chief');
    expect(result.active_chief).toBe('business_chief');
  });

  it('debe devolver un plan vacío cuando el paso no es delegar', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (LLMService.getStructuredData as jest.MockedFunction<any>).mockResolvedValue({
      analysis: 'Todo listo',
      next_step: 'finish',
      reasoning: 'No hay más tareas',
      is_complete: true
    });

    const result = await ceo_node(initialState);

    expect(result.plan).toEqual([]);
  });
});
