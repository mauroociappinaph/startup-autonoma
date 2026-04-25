/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest, describe, it, expect, afterEach } from '@jest/globals';
import { ceo_node } from '@/nodes/ceo.js';
import { LLMService } from '@/services/llmService.js';
import { HumanMessage } from '@langchain/core/messages';

describe('CEO Node Routing', () => {
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
