import { jest, describe, it, expect, afterEach } from '@jest/globals';
import child_process from 'child_process';
import { AIMessage } from '@langchain/core/messages';
import { AgentStateType } from '@startup/shared';

// Mockeamos ioredis para evitar conexiones reales
jest.mock('ioredis', () => {
  const MockRedis = jest.fn().mockImplementation(() => ({
    pipeline: (jest.fn() as any).mockImplementation(() => ({ rpush: (jest.fn() as any).mockReturnThis(), ltrim: (jest.fn() as any).mockReturnThis(), expire: (jest.fn() as any).mockReturnThis(), hincrbyfloat: (jest.fn() as any).mockReturnThis(), hincrby: (jest.fn() as any).mockReturnThis(), exec: (jest.fn() as any).mockResolvedValue([]) })),
    hincrbyfloat: (jest.fn() as any).mockReturnThis(),
    hincrby: (jest.fn() as any).mockReturnThis(),
    rpush: (jest.fn() as any).mockReturnThis(),
    ltrim: (jest.fn() as any).mockReturnThis(),
    expire: (jest.fn() as any).mockReturnThis(),
    lrange: (jest.fn() as any).mockResolvedValue([]),
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

jest.mock('@/helpers/logger.js', () => ({
  SacredLogger: {
    node: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
    warn: jest.fn()
  }
}));

describe('Operations Worker Node', () => {
  let operations_worker_node: any;

  beforeAll(async () => {
    const workerModule = await import('../nodes/workers/operations_worker_node.js');
    operations_worker_node = workerModule.operations_worker_node;
  });


  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('debería ejecutar un comando de monitoreo exitosamente', async () => {
    const mockState = {
      messages: [
        new AIMessage({
          content: 'Delegando al worker',
          additional_kwargs: {
            operations_instruction: {
              command: 'docker_ps',
              reasoning: 'Verificando estado'
            }
          }
        })
      ],
      active_chief: 'operations_chief',
      iteration: 0
    } as unknown as AgentStateType;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.spyOn(child_process, 'exec').mockImplementation(((_cmd: string, _opts: unknown, callback?: (error: Error | null, stdout: string, stderr: string) => void) => {
      const cb = typeof _opts === 'function' ? _opts : callback;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (cb) (cb as any)(null, 'backend: Up 2 hours', '');
      return {} as child_process.ChildProcess;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any);

    const result = await operations_worker_node(mockState);

    expect(result.executive_summary).toContain('backend: Up 2 hours');
    expect(result.next_node).toBe('operations_chief');
  });

  it('debería manejar errores de ejecución', async () => {
    const mockState = {
      messages: [
        new AIMessage({
          content: 'Delegando al worker',
          additional_kwargs: {
            operations_instruction: {
              command: 'docker_logs',
              args: ['invalid'],
              reasoning: 'Revisando logs'
            }
          }
        })
      ],
      iteration: 0
    } as unknown as AgentStateType;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.spyOn(child_process, 'exec').mockImplementation(((_cmd: string, _opts: unknown, callback?: (error: Error | null, stdout: string, stderr: string) => void) => {
      const cb = typeof _opts === 'function' ? _opts : callback;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (cb) (cb as any)(new Error('No such container'), '', 'Error de docker');
      return {} as child_process.ChildProcess;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any);

    const result = await operations_worker_node(mockState);

    expect(result.executive_summary).toContain('Error');
    expect(result.executive_summary).toContain('No such container');
  });
});
