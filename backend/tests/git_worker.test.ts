import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// 1. Mockeamos el módulo ANTES de cualquier import del código fuente
jest.mock('child_process', () => ({
  exec: jest.fn()
}));

// Importamos exec para poder configurar el mock
import { exec } from 'child_process';
/* eslint-disable @typescript-eslint/no-explicit-any */
// Usamos any para evitar peleas con las sobrecargas y la propiedad __promisify__ de exec
const mockedExec = exec as any;

describe('Git Worker Node', () => {
  let gitWorkerNode: any;

  beforeEach(async () => {
    mockedExec.mockClear();
    // 2. Importamos dinámicamente para asegurarnos de que tome el mock fresco
    const module: any = await import('@/nodes/workers/gitWorker.js');
    gitWorkerNode = module.gitWorker;
  });

  it('debería traducir la acción commit-all correctamente', async () => {
    mockedExec.mockImplementation((_cmd: string, _opts: any, callback: any) => {
      const cb = typeof _opts === 'function' ? _opts : callback;
      // Simulamos la salida clásica de git commit: [branch abc1234] mensaje
      if (cb) cb(null, '[main abc1234] feat: test commit', '');
      return {} as any;
    });

    const result = await gitWorkerNode({
      payload: {
        action: 'commit-all',
        message: 'feat: test commit'
      }
    });

    expect(result.success).toBe(true);
    expect(result.commitId).toBeDefined();
    expect(result.commitId).toBe('abc1234');
  });

  it('debería manejar errores de Git correctamente', async () => {
    mockedExec.mockImplementation((_cmd: string, _opts: any, callback: any) => {
      const cb = typeof _opts === 'function' ? _opts : callback;
      const error = new Error('Command failed');
      (error as any).stderr = 'fatal: not a git repository';
      if (cb) cb(error, '', 'fatal: not a git repository');
      return {} as any;
    });

    const result = await gitWorkerNode({
      payload: { action: 'pull' }
    });

    expect(result.success).toBe(false);
    expect(result.errorMessage).toContain('Command failed');
  });

  it('debería crear una branch correctamente', async () => {
    mockedExec.mockImplementation((_cmd: string, _opts: any, callback: any) => {
      const cb = typeof _opts === 'function' ? _opts : callback;
      if (cb) cb(null, "Switched to a new branch 'feat/nueva-feature'", '');
      return {} as any;
    });

    const result = await gitWorkerNode({
      payload: {
        action: 'create-branch',
        branchName: 'feat/nueva-feature',
        baseBranch: 'develop'
      }
    });

    expect(result.success).toBe(true);
    expect(result.branchName).toBe('feat/nueva-feature');
  });
});
