/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest, describe, it, expect, afterEach } from '@jest/globals';
import { operations_chief_node } from './operations_chief.js';
import { LLMService } from '@/services/llmService.js';
import { HumanMessage } from '@langchain/core/messages';

describe('Operations Chief Node', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('debería delegar al worker para una tarea de monitoreo', async () => {
    const mockState: any = {
      messages: [new HumanMessage('¿Cómo está el sistema?')],
      project_context: { workDir: '/tmp' }
    };

    jest.spyOn(LLMService, 'getStructuredData').mockResolvedValue({
      data: {
        reasoning: 'Necesito ver el estado de los contenedores',
        action: 'monitor',
        details: 'docker_ps',
        priority: 'high',
        requires_approval: false
      },
      usage: {} as any,
      cost: 0,
      latency: 100,
      model: 'test-model'
    });

    const result = await operations_chief_node(mockState);

    expect(result.next_node).toBe('operations_worker');
    const lastMsg = result.messages?.[result.messages.length - 1] as any;
    expect(lastMsg.additional_kwargs.operations_instruction.command).toBe('docker_ps');
  });

  it('debería volver al CEO si requiere aprobación', async () => {
    const mockState: any = {
      messages: [new HumanMessage('Desplegá a producción')],
      project_context: { workDir: '/tmp' }
    };

    jest.spyOn(LLMService, 'getStructuredData').mockResolvedValue({
      data: {
        reasoning: 'Acción crítica detectada',
        action: 'deploy',
        details: 'npm_build',
        priority: 'high',
        requires_approval: true
      },
      usage: {} as any,
      cost: 0,
      latency: 100,
      model: 'test-model'
    });

    const result = await operations_chief_node(mockState);

    expect(result.next_node).toBe('ceo');
  });
});
