import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { business_chief_node } from '@/nodes/chiefs/business_chief.js';
import { LLMService } from '@/services/llmService.js';
import { HumanMessage } from '@langchain/core/messages';

// Mock de LLMService para no gastar tokens en los tests
jest.mock('@/services/llmService.js');

describe('Business Chief Node', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe decidir delegar al Researcher cuando se pide análisis de competencia', async () => {
    const mockResponse = {
      decision: 'delegate_to_researcher',
      reasoning: 'Necesito entender a los competidores antes de actuar.',
      worker_instruction: 'Analiza los 3 competidores principales de CRM para startups.'
    };

    (LLMService.getStructuredResponse as any).mockResolvedValue(mockResponse);

    const initialState: any = {
      messages: [new HumanMessage('¿Quiénes son nuestros competidores?')],
      plan: [],
      trace_id: 'test-trace'
    };

    const result = await business_chief_node(initialState);

    expect(result.decision).toBeUndefined(); // El nodo devuelve actualizaciones, no la respuesta del LLM directamente
    expect(result.plan).toContain('research');
    expect(result.active_chief).toBe('business_chief');
  });

  it('debe decidir delegar al AI Engine para Lead Generation', async () => {
    const mockResponse = {
      decision: 'delegate_to_lead_gen',
      reasoning: 'Vamos a buscar leads reales para validar el mercado.',
      worker_instruction: 'Busca dueños de agencias de marketing en Madrid.',
      lead_gen_payload: {
        niche: 'marketing_agencies',
        location: 'Madrid',
        limit: 5
      }
    };

    (LLMService.getStructuredResponse as any).mockResolvedValue(mockResponse);

    const initialState: any = {
      messages: [new HumanMessage('Necesito 5 clientes potenciales en Madrid.')],
      plan: [],
      trace_id: 'biz-trace'
    };

    const result = await business_chief_node(initialState);

    expect(result.plan).toContain('ai_engine_task');
    const lastMsg: any = result.messages![result.messages!.length - 1];
    expect(lastMsg.additional_kwargs.ai_engine_task.worker_name).toBe('lead_gen');
  });
});
