/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest, describe, it, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';
import { test_runner } from '@/tools/domain/software/testRunner.js';

// Mockeamos ioredis para evitar conexiones reales
jest.mock('ioredis', () => {
  const MockRedis = jest.fn().mockImplementation(() => ({
    pipeline: (jest.fn() as any).mockReturnThis(),
    hincrbyfloat: (jest.fn() as any).mockReturnThis(),
    hincrby: (jest.fn() as any).mockReturnThis(),
    exec: (jest.fn() as any).mockResolvedValue([]),
    hgetall: (jest.fn() as any).mockResolvedValue({}),
    set: (jest.fn() as any).mockResolvedValue("OK"),
    get: (jest.fn() as any).mockResolvedValue(null),
    publish: (jest.fn() as any).mockResolvedValue(1),
    on: jest.fn() as any,
    quit: (jest.fn() as any).mockResolvedValue("OK")
  }));
  return {
    Redis: MockRedis,
    default: MockRedis
  };
});

describe('Test Runner Node', () => {
  let test_runner_node: any;

  beforeAll(async () => {
    const module = await import('@/nodes/workers/test_runner_node.js');
    test_runner_node = module.test_runner_node;
  });

  afterAll(async () => {
    const { closeRedisConnections } = await import('@/db/redis.js');
    await closeRedisConnections();
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('debería ejecutar tests exitosamente y devolver reporte de éxito', async () => {
    const runnerSpy = jest.spyOn(test_runner, 'invoke').mockResolvedValue({
      success: true,
      summary: 'Tests: 5 passed, 5 total',
      commandExecuted: 'npm test',
      stdout: 'All tests passed',
      stderr: ''
    });

    const state: any = {
      messages: [{
        additional_kwargs: {
          test_instruction: {
            package: 'backend',
            filter: 'git_worker'
          }
        }
      }]
    };

    const result = await test_runner_node(state);

    expect(result.executive_summary).toContain('Validación exitosa');
    expect(result.messages?.[0].content).toContain('Tests: 5 passed, 5 total');
    expect(runnerSpy).toHaveBeenCalled();
  });

  it('debería manejar fallos en la suite de tests', async () => {
    const runnerSpy = jest.spyOn(test_runner, 'invoke').mockResolvedValue({
      success: false,
      summary: 'Tests: 1 failed, 4 passed, 5 total',
      commandExecuted: 'npm test',
      stdout: '',
      stderr: 'Test failed at line 10'
    });

    const state: any = {
      messages: [{
        additional_kwargs: {
          test_instruction: {
            package: 'backend'
          }
        }
      }]
    };

    const result = await test_runner_node(state);

    expect(result.executive_summary).toContain('Validación fallida');
    expect(result.messages?.[0].content).toContain('Tests: 1 failed, 4 passed, 5 total');
    expect(runnerSpy).toHaveBeenCalled();
  });
});
