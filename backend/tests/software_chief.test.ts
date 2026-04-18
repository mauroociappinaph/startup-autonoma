/* eslint-disable @typescript-eslint/no-explicit-any */
import { software_chief_node } from '@/nodes/chiefs/software_chief.js';
import { LLMService } from '@/services/llmService.js';
import { TelemetryService } from '@/services/telemetryService.js';
import { AuditService } from '@/services/auditService.js';
import { AgentStateType } from '@/types/state.types.js';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { HumanMessage } from '@langchain/core/messages';

// Mockeamos los servicios
jest.mock('@/services/llmService.js');
jest.mock('@/services/telemetryService.js');
jest.mock('@/services/auditService.js');

describe('SoftwareChief Node Delegation', () => {
  let initialState: AgentStateType;

  beforeEach(() => {
    initialState = {
      original_prompt: "Crea una branch para el refactor",
      refined_prompt: "Crea una branch para el refactor",
      messages: [new HumanMessage("Crea una branch para el refactor")],
      active_chief: '',
      plan: [],
      completed_steps: [],
      executive_summary: '',
      retry_count: 0,
      iteration_count: 0,
      last_recorded_tokens: 0,
      total_cost_usd: 0,
      token_usage: { total: 0, prompt: 0, completion: 0 },
      project_context: {
        projectId: 'test-project',
        maxTokenBudget: 100000,
        contextWindow: 128000
      }
    } as any;
    jest.clearAllMocks();
  });

  it('debe delegar al ResearchWorker cuando el razonamiento sugiere investigación', async () => {
    (LLMService.getStructuredData as jest.MockedFunction<typeof LLMService.getStructuredData>).mockResolvedValue({
      data: {
        decision: "delegate_to_researcher",
        reasoning: "Necesitamos entender cómo está estructurado el código antes de cambiar nada.",
        worker_instruction: "Explora la estructura del proyecto."
      },
      usage: { total: 100, prompt: 50, completion: 50 },
      cost: 0.001,
      latency: 500,
      model: "nemotron-340b"
    });

    const result = await software_chief_node(initialState);

    expect(result.active_chief).toBe('software_chief');
    expect(result.total_cost_usd).toBe(0.001);
    expect(TelemetryService.recordMetric).toHaveBeenCalled();
  });

  it('debe delegar al GitWorker con el payload correcto para crear una branch', async () => {
    (LLMService.getStructuredData as jest.MockedFunction<typeof LLMService.getStructuredData>).mockResolvedValue({
      data: {
        decision: "delegate_to_git_worker",
        reasoning: "Creando branch para iniciar el desarrollo.",
        git_payload: { action: "create_branch", branchName: "feat/test", baseBranch: "main" }
      },
      usage: { total: 150, prompt: 75, completion: 75 },
      cost: 0.0015,
      latency: 450,
      model: "nemotron-340b"
    });

    const result = await software_chief_node(initialState);

    expect(result.active_chief).toBe('software_chief');
    expect(result.total_cost_usd).toBe(0.0015);
    expect(AuditService.logDecision).toHaveBeenCalled();
  });

  it('debe delegar al TestRunner con el payload correcto para validar calidad', async () => {
    (LLMService.getStructuredData as jest.MockedFunction<typeof LLMService.getStructuredData>).mockResolvedValue({
      data: {
        decision: "delegate_to_test_runner",
        reasoning: "Validando que los cambios no rompan la suite de tests.",
        test_payload: { package: "backend", filter: "git_worker" }
      },
      usage: { total: 120, prompt: 60, completion: 60 },
      cost: 0.0012,
      latency: 400,
      model: "nemotron-340b"
    });

    const result = await software_chief_node(initialState);

    expect(result.active_chief).toBe('software_chief');
    expect(result.total_cost_usd).toBe(0.0012);
  });

  it('debe finalizar la misión cuando la decisión es "complete"', async () => {
    (LLMService.getStructuredData as jest.MockedFunction<typeof LLMService.getStructuredData>).mockResolvedValue({
      data: {
        decision: "complete",
        reasoning: "Todas las tareas técnicas han sido completadas con éxito."
      },
      usage: { total: 80, prompt: 40, completion: 40 },
      cost: 0.0008,
      latency: 300,
      model: "nemotron-340b"
    });

    const result = await software_chief_node(initialState);

    expect(result.plan).toEqual([]);
    expect(result.executive_summary).toBe('Todas las tareas técnicas han sido completadas con éxito.');
  });
});
