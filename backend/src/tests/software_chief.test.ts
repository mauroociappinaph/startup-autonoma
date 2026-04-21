/* eslint-disable @typescript-eslint/no-explicit-any */
import { software_chief_node } from '@/nodes/chiefs/software_chief.js';
import { LLMService } from '@/services/llmService.js';
import { TelemetryService } from '@/services/telemetryService.js';
import { AuditService } from '@/services/auditService.js';
import { AgentStateType } from '@/types/state.types.js';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { HumanMessage } from '@langchain/core/messages';

// Mockeamos los servicios que dejan handles abiertos
jest.mock('ioredis', () => {
  const MockRedis = jest.fn().mockImplementation(() => ({
    pipeline: (jest.fn() as any).mockReturnThis(),
    hincrbyfloat: (jest.fn() as any).mockReturnThis(),
    hincrby: (jest.fn() as any).mockReturnThis(),
    exec: (jest.fn() as any).mockResolvedValue([]),
    hgetall: (jest.fn() as any).mockResolvedValue({}),
    set: (jest.fn() as any).mockResolvedValue("OK"),
    get: (jest.fn() as any).mockResolvedValue(null),
    on: jest.fn() as any,
    quit: (jest.fn() as any).mockResolvedValue("OK")
  }));
  return {
    Redis: MockRedis,
    default: MockRedis
  };
});

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
        projectId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test Project',
        workDir: '/tmp/test',
        engramNamespace: 'test-namespace',
        maxTokenBudget: 100000
      },
      reasoning: ""
    } as any;
    jest.clearAllMocks();
  });

  it('debe delegar al ResearchWorker cuando el razonamiento sugiere investigación', async () => {
    const llmSpy = jest.spyOn(LLMService, 'getStructuredData').mockResolvedValue({
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

    const telemetrySpy = jest.spyOn(TelemetryService, 'recordMetric').mockResolvedValue(0.001);

    const result = await software_chief_node(initialState);

    expect(result.active_chief).toBe('software_chief');
    expect(result.total_cost_usd).toBe(0.001);
    expect(telemetrySpy).toHaveBeenCalled();
    expect(llmSpy).toHaveBeenCalled();
  });

  it('debe delegar al GitWorker con el payload correcto para crear una branch', async () => {
    const llmSpy = jest.spyOn(LLMService, 'getStructuredData').mockResolvedValue({
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

    const auditSpy = jest.spyOn(AuditService, 'logDecision').mockResolvedValue(undefined);

    const result = await software_chief_node(initialState);

    expect(result.active_chief).toBe('software_chief');
    expect(result.total_cost_usd).toBe(0.0015);
    expect(auditSpy).toHaveBeenCalled();
    expect(llmSpy).toHaveBeenCalled();
  });

  it('debe delegar al TestRunner con el payload correcto para validar calidad', async () => {
    const llmSpy = jest.spyOn(LLMService, 'getStructuredData').mockResolvedValue({
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
    expect(llmSpy).toHaveBeenCalled();
  });

  it('debe finalizar la misión cuando la decisión es "complete"', async () => {
    const llmSpy = jest.spyOn(LLMService, 'getStructuredData').mockResolvedValue({
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
    expect(llmSpy).toHaveBeenCalled();
  });
});
