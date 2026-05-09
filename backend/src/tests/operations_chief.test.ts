import { jest, describe, it, expect, afterEach, beforeAll, afterAll } from '@jest/globals';
import { HumanMessage } from '@langchain/core/messages';

// ioredis is now mocked globally in jest.setup.ts

describe('Operations Chief Node', () => {
  let operations_chief_node: any;
  let LLMService: any;

  beforeAll(async () => {
    const chiefModule = await import('../nodes/chiefs/operations_chief.js');
    const llmModule = await import('@/services/llmService.js');
    operations_chief_node = chiefModule.operations_chief_node;
    LLMService = llmModule.LLMService;
  });


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
    expect(lastMsg.additional_kwargs.operations_instruction.command).toBe('monitor');
    expect(lastMsg.additional_kwargs.operations_instruction.args[0]).toBe('docker_ps');
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
