import { software_chief_node } from '@/nodes/chiefs/software_chief';
import { LLMService } from '@/services/llmService';
import { AgentStateType } from '@/types/state';
import { jest } from '@jest/globals';

// Mockeamos el servicio de LLM
jest.mock('@/services/llmService');

describe('SoftwareChief Node', () => {
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
      trace_id: 'test-trace',
      metadata: {},
      results: [],
      feedback: []
    };
    jest.clearAllMocks();
  });

  it('debe delegar a research cuando la misión incluye "investigar"', async () => {
    // Configuramos el mock para que devuelva una misión con "investigar"
    (LLMService.getStructuredResponse as jest.MockedFunction<typeof LLMService.getStructuredResponse>).mockResolvedValue({
      mision: 'Debes investigar nuevas librerías de scraping'
    });

    const result = await software_chief_node(initialState);

    expect(result.active_chief).toBe('software_chief');
    expect(result.plan).toContain('research');
  });

  it('debe devolver un plan vacío si no hay palabras clave de research', async () => {
    (LLMService.getStructuredResponse as jest.MockedFunction<typeof LLMService.getStructuredResponse>).mockResolvedValue({
      mision: 'Implementa un nuevo barrel file'
    });

    const result = await software_chief_node(initialState);

    expect(result.plan).toEqual([]);
  });
});
