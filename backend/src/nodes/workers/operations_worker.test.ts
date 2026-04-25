/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest, describe, it, expect, afterEach } from '@jest/globals';
import child_process from 'child_process';
import { operations_worker_node } from './operations_worker.js';
import { AIMessage } from '@langchain/core/messages';

describe('Operations Worker Node', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('debería ejecutar un comando de monitoreo exitosamente', async () => {
    const mockState: any = {
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
      active_chief: 'operations_chief'
    };

    jest.spyOn(child_process, 'exec').mockImplementation((_cmd: string, _opts: any, callback: any) => {
      const cb = typeof _opts === 'function' ? _opts : callback;
      cb(null, 'backend: Up 2 hours', '');
      return {} as any;
    });

    const result = await operations_worker_node(mockState);

    expect(result.executive_summary).toContain('backend: Up 2 hours');
    expect(result.next_node).toBe('operations_chief');
  });

  it('debería manejar errores de ejecución', async () => {
    const mockState: any = {
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
      ]
    };

    jest.spyOn(child_process, 'exec').mockImplementation((_cmd: string, _opts: any, callback: any) => {
      const cb = typeof _opts === 'function' ? _opts : callback;
      cb(new Error('No such container'), '', 'Error de docker');
      return {} as any;
    });

    const result = await operations_worker_node(mockState);

    expect(result.executive_summary).toContain('Error');
    expect(result.executive_summary).toContain('No such container');
  });
});
