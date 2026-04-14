import { software_chief_node } from '@/nodes/chiefs/software_chief.js';
import { LLMService } from '@/services/llmService.js';
import { AgentStateType } from '@/types/state.types.js';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { HumanMessage } from '@langchain/core/messages';

// Mockeamos el servicio de LLM
jest.mock('@/services/llmService.js');

describe('SoftwareChief Node Delegation', () => {
  let initialState: AgentStateType;

  beforeEach(() => {
    initialState = {
      messages: [new HumanMessage("Crea una branch para el refactor")],
      active_chief: '',
      plan: [],
      executive_summary: '',
      retry_count: 0,
    };
    jest.clearAllMocks();
  });

  it('debe delegar al ResearchWorker cuando el razonamiento sugiere investigación', async () => {
    (LLMService.getStructuredResponse as jest.MockedFunction<typeof LLMService.getStructuredResponse>).mockResolvedValue({
      decision: 'delegate_to_researcher',
      reasoning: 'Necesitamos entender cómo está estructurado el código antes de cambiar nada.',
      worker_instruction: 'Explora la carpeta src/nodes'
    });

    const result = await software_chief_node(initialState);

    expect(result.active_chief).toBe('software_chief');
    expect(result.plan).toContain('research');
    expect(result.messages?.[0].content).toContain('Delegando investigación');
  });

  it('debe delegar al GitWorker con el payload correcto para crear una branch', async () => {
    const gitPayload = {
      action: 'create-branch',
      branchName: 'feat/refactor-auth',
      baseBranch: 'develop'
    };

    (LLMService.getStructuredResponse as jest.MockedFunction<typeof LLMService.getStructuredResponse>).mockResolvedValue({
      decision: 'delegate_to_git_worker',
      reasoning: 'Creando branch para iniciar el desarrollo.',
      git_payload: gitPayload
    });

    const result = await software_chief_node(initialState);

    expect(result.active_chief).toBe('software_chief');
    expect(result.plan).toContain('git_operation');
    
    // Verificamos que los kwargs del mensaje contengan la instrucción para el Git Worker node
    const delegationMessage = result.messages?.[0] as any;
    expect(delegationMessage.additional_kwargs.git_instruction.payload).toEqual(gitPayload);
  });

  it('debe finalizar la misión cuando la decisión es "complete"', async () => {
    (LLMService.getStructuredResponse as jest.MockedFunction<typeof LLMService.getStructuredResponse>).mockResolvedValue({
      decision: 'complete',
      reasoning: 'Todas las tareas técnicas han sido completadas con éxito.'
    });

    const result = await software_chief_node(initialState);

    expect(result.plan).toEqual([]);
    expect(result.executive_summary).toBe('Todas las tareas técnicas han sido completadas con éxito.');
  });
});
