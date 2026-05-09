import { jest, describe, it, expect, afterEach, beforeAll, afterAll } from '@jest/globals';
import { HumanMessage } from '@langchain/core/messages';
import { AgentStateType } from '@startup/shared';

import { ceo_node } from '@/nodes/ceo.js';
import { LLMService } from '@/services/llmService.js';

describe('CEO Node Routing', () => {


  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('debería delegar al Operations Chief para consultas de infraestructura', async () => {
    const mockState = {
      messages: [new HumanMessage('¿Cómo están los contenedores de docker?')],
    } as unknown as AgentStateType;

    jest.spyOn(LLMService, 'getStructuredData').mockResolvedValue({
      data: {
        reasoning: 'El usuario pregunta por el estado de docker',
        analysis: 'Necesito consultar a operaciones',
        next_step: 'delegate',
        delegated_to: 'operations_chief',
        task_description: 'Check docker status',
        is_complete: false
      },
      usage: { total: 0, prompt: 0, completion: 0 },
      cost: 0,
      latency: 100,
      model: 'test-model'
    });

    const result = await ceo_node(mockState);

    expect(result.active_chief).toBe('operations_chief');
  });
});
