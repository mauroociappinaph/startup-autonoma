import { jest, describe, it, expect, afterEach } from '@jest/globals';
import child_process from 'child_process';
import { operations_worker_node } from '@/nodes/workers/operations_worker.js';
import { AIMessage } from '@langchain/core/messages';
import { AgentStateType } from '@startup/shared';

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
