/* eslint-disable @typescript-eslint/no-explicit-any */
import { mirror_node } from '@/nodes/mirror.js';
import { LLMService } from '@/services/llmService.js';
import { AgentStateType } from '@/types/state.types.js';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { HumanMessage } from '@langchain/core/messages';

// Mockeamos el servicio de LLM
jest.mock('@/services/llmService.js');

describe('MirrorAgent Node', () => {
  let initialState: AgentStateType;

  beforeEach(() => {
    initialState = {
      original_prompt: "creame una branch y hace un commit",
      refined_prompt: "",
      messages: [new HumanMessage("creame una branch y hace un commit")],
      active_chief: '',
      plan: [],
      completed_steps: [],
      executive_summary: '',
      retry_count: 0,
      iteration_count: 0,
      last_recorded_tokens: 0,
      token_usage: { total: 0, prompt: 0, completion: 0 }
    };
    jest.clearAllMocks();
  });

  it('debería refinar el prompt y detectar intenciones correctamente', async () => {
    const mockRefined = "Crear una nueva rama de desarrollo y realizar un commit con los cambios actuales.";
    const mockIntentions = ["crear branch", "realizar commit"];

    (LLMService.getStructuredData as jest.MockedFunction<typeof LLMService.getStructuredData>).mockResolvedValue({
      data: {
        refined_prompt: "Crear una nueva rama de desarrollo y realizar un commit con los cambios actuales.",
        intentions: ["crear branch", "realizar commit"],
        missing_info: [],
        suggested_next_steps: ["delegar al Software Chief"],
        requires_human_approval: false,
      },
      usage: { total: 100, prompt: 50, completion: 50 },
      cost: 0.001,
      latency: 500,
      model: "gpt-4o"
    });

    const result = await mirror_node(initialState);

    expect(result.refined_prompt).toBe(mockRefined);
    expect(result.executive_summary).toContain('Mirror optimizó la petición');
    expect(result.messages?.[0].content).toContain(mockRefined);
    expect(result.messages?.[0].content).toContain(mockIntentions[0]);
  });

  it('debería fallar si no hay mensaje humano en el historial', async () => {
    initialState.messages = []; // Limpiamos mensajes

    const result = await mirror_node(initialState);

    expect(result.executive_summary).toContain('Error: No hay una instrucción humana');
  });
});
