import { gitWorker } from '@/nodes/workers/gitWorker.js';
import * as childProcess from 'child_process';
import { jest } from '@jest/globals';

describe('Git Worker Node', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let execSpy: any;

  beforeAll(() => {
    // Usamos jest.spyOn para mockear la función exec de child_process
    execSpy = jest.spyOn(childProcess, 'exec');
  });

  beforeEach(() => {
    // Limpiamos los mocks antes de cada test
    execSpy.mockClear();
  });

  afterAll(() => {
    // Restauramos la implementación original de exec después de todas las pruebas
    execSpy.mockRestore();
  });

  it('debería traducir la acción commit-all correctamente', async () => {
    execSpy.mockImplementation(
      (command: string, options: childProcess.ExecOptions | null, callback: (error: Error | null, stdout: string, stderr: string) => void) => {
        const cb = typeof options === 'function' ? options : callback;
        if (cb) cb(null, '[main abc1234] feat: test commit', '');
      }
    );

    const result = await gitWorker({
      payload: {
        action: 'commit-all',
        message: 'feat: test commit'
      }
    });

    expect(result.success).toBe(true);
    expect(result.commitId).toBe('abc1234');
    expect(execSpy).toHaveBeenCalledWith(
      expect.stringContaining('git add . && git commit -m "feat: test commit"'),
      expect.any(Object), // options argument
      expect.any(Function) // callback argument
    );
  });

  it('debería manejar errores de Git correctamente', async () => {
    execSpy.mockImplementation((command: string, options: any, callback: (error: Error | null, stdout: string, stderr: string) => void) => {
      const cb = typeof options === 'function' ? options : callback;
      const error = new Error('Command failed');
      (error as any).stderr = 'fatal: not a git repository';
      if (cb) cb(error, '', 'fatal: not a git repository');
    });

    const result = await gitWorker({
      payload: {
        action: 'pull'
      }
    });

    expect(result.success).toBe(false);
    expect(result.errorMessage).toContain('Command failed');
    expect(result.stderr).toBe('fatal: not a git repository');
  });

  it('debería crear una branch correctamente con su flujo base', async () => {
    execSpy.mockImplementation((command: string, options: any, callback: (error: Error | null, stdout: string, stderr: string) => void) => {
      const cb = typeof options === 'function' ? options : callback;
      if (cb) cb(null, "Switched to a new branch 'feat/nueva-feature'", '');
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
    expect(execSpy).toHaveBeenCalledWith(
      expect.stringContaining('git checkout develop && git pull origin develop && git checkout -b feat/nueva-feature'),
      expect.any(Object), // options argument
      expect.any(Function) // callback argument
    );
  });
});
