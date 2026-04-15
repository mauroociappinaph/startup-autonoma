import { ceo_node } from '@/nodes/ceo.js';
import { LLMService } from '@/services/llmService.js';
import { AgentStateType } from '@/types/state.types.js';
import { jest } from '@jest/globals';

// Mockeamos el servicio de LLM
jest.mock('@/services/llmService.js');

describe('CEO Agent Node', () => {
  let initialState: AgentStateType;

  beforeEach(() => {
    initialState = {
      messages: [],
      active_chief: '',
      plan: [],
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

  it('debe actualizar el plan a ["research"] cuando el CEO decide delegar', async () => {
    (LLMService.getStructuredResponse as jest.MockedFunction<typeof LLMService.getStructuredResponse>).mockResolvedValue({
      analysis: 'Análisis de prueba',
      next_step: 'delegate',
      reasoning: 'Necesitamos investigar el mercado'
    });

    const result = await ceo_node(initialState);

    expect(result.executive_summary).toBe('Análisis de prueba');
    expect(result.plan).toContain('research');
  });

  it('debe devolver un plan vacío cuando el paso no es delegar', async () => {
    (LLMService.getStructuredResponse as jest.MockedFunction<typeof LLMService.getStructuredResponse>).mockResolvedValue({
      analysis: 'Todo listo',
      next_step: 'complete',
      reasoning: 'No hay más tareas'
    });

    const result = await ceo_node(initialState);

    expect(result.plan).toEqual([]);
  });
});
