/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest, describe, it, expect, afterEach } from '@jest/globals';
import child_process from 'child_process';
import { gitWorker } from '@/nodes/workers/gitWorker.js';

// Mockeamos fs para evitar acceso real a disco en tests de idempotencia
jest.mock('fs/promises');

/**
 * Tests del Git Worker Node.
 *
 * ESTRATEGIA DE MOCK: Se usa jest.spyOn sobre `child_process.exec` (default
 * import) en lugar de `jest.mock('child_process')`. Esto funciona porque
 * gitWorker.ts importa el módulo como objeto (`import child_process from ...`)
 * y llama a `child_process.exec` en tiempo de ejecución, lo que permite
 * que spyOn intercepte la referencia correctamente.
 */
describe('Git Worker Node', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('debería traducir la acción commit-all correctamente', async () => {
    jest.spyOn(child_process, 'exec').mockImplementation((cmd: string, _opts: any, callback: any) => {
      const cb = typeof _opts === 'function' ? _opts : callback;
      if (cmd.includes('status')) {
        cb(null, 'M  file.ts\n', '');
      } else if (cmd.includes('commit')) {
        cb(null, '[main abc1234] feat: test commit\n 1 file changed, 1 insertion(+)\n', '');
      } else {
        cb(null, '', '');
      }
      return {} as any;
    });

    const result = await gitWorker({
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
    jest.spyOn(child_process, 'exec').mockImplementation((_cmd: string, _opts: any, callback: any) => {
      const cb = typeof _opts === 'function' ? _opts : callback;
      const error = new Error('Command failed');
      cb(error, '', 'fatal: not a git repository');
      return {} as any;
    });

    const result = await gitWorker({
      payload: { action: 'pull' }
    });

    expect(result.success).toBe(false);
    expect(result.errorMessage).toContain('Command failed');
  });

  it('debería crear una branch correctamente', async () => {
    jest.spyOn(child_process, 'exec').mockImplementation((cmd: string, _opts: any, callback: any) => {
      const cb = typeof _opts === 'function' ? _opts : callback;
      if (cmd.includes('--list')) {
        // Rama NO existe → stdout vacío
        cb(null, '', '');
      } else {
        cb(null, "Switched to a new branch 'feat/nueva-feature'", '');
      }
      return {} as any;
    });

    const result = await gitWorker({
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
