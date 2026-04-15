/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// 1. Mockeamos child_process.exec ANTES de cualquier import
jest.mock('child_process', () => ({
  exec: jest.fn()
}));

import { exec } from 'child_process';
const mockedExec = exec as any;

describe('Test Runner Node', () => {
  let test_runner_node: any;

  beforeEach(async () => {
    mockedExec.mockClear();
    // 2. Import dinámico para asegurar que tome el mock fresco
    const module: any = await import('@/nodes/workers/test_runner_node.js');
    test_runner_node = module.test_runner_node;
  });

  it('debería ejecutar tests exitosamente y devolver reporte de éxito', async () => {
    mockedExec.mockImplementation((_cmd: string, _opts: any, callback: any) => {
      // Simulamos salida de Jest exitosa con el formato real
      callback(null, '', 'Tests: 5 passed, 5 total\n');
      return {} as any;
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
    expect(result.messages[0].content).toContain('Tests: 5 passed, 5 total');
  });

  it('debería manejar fallos en la suite de tests', async () => {
    mockedExec.mockImplementation((_cmd: string, _opts: any, callback: any) => {
      // Simulamos fallo en tests (error no nulo) con formato real
      const error = new Error('Test suite failed');
      callback(error, '', 'Tests: 1 failed, 4 passed, 5 total\n');
      return {} as any;
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
    expect(result.messages[0].content).toContain('Tests: 1 failed, 4 passed, 5 total');
  });
});
