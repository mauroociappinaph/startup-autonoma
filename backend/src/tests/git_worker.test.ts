import { jest, describe, it, expect, afterEach } from '@jest/globals';
import child_process from 'child_process';
import { gitWorker } from '@/nodes/workers/gitWorker.js';
import fs from 'fs/promises';
import { Stats } from 'fs';

describe('Git Worker Node', () => {
  beforeEach(() => {
    jest.spyOn(fs, 'stat').mockResolvedValue({
      isDirectory: () => true
    } as unknown as Stats);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('debería traducir la acción commit-all correctamente', async () => {
    jest.spyOn(child_process, 'exec').mockImplementation(((cmd: string, _opts: unknown, callback?: (error: Error | null, stdout: string, stderr: string) => void) => {
      const cb = typeof _opts === 'function' ? _opts : callback;
      if (cmd.includes('status')) {
        cb?.(null, 'M  file.ts\n', '');
      } else if (cmd.includes('commit')) {
        cb?.(null, '[main abc1234] feat: test commit\n 1 file changed, 1 insertion(+)\n', '');
      } else {
        cb?.(null, '', '');
      }
      return {} as child_process.ChildProcess;
    }) as unknown as typeof child_process.exec);

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
    jest.spyOn(child_process, 'exec').mockImplementation(((_cmd: string, _opts: unknown, callback?: (error: Error | null, stdout: string, stderr: string) => void) => {
      const cb = typeof _opts === 'function' ? _opts : callback;
      const error = new Error('Command failed');
      if (cb) cb(error, '', 'fatal: not a git repository');
      return {} as child_process.ChildProcess;
    }) as unknown as typeof child_process.exec);

    const result = await gitWorker({
      payload: { action: 'pull' }
    });

    expect(result.success).toBe(false);
    expect(result.errorMessage).toContain('Command failed');
  });

  it('debería crear una branch correctamente', async () => {
    jest.spyOn(child_process, 'exec').mockImplementation(((cmd: string, _opts: unknown, callback?: (error: Error | null, stdout: string, stderr: string) => void) => {
      const cb = typeof _opts === 'function' ? _opts : callback;
      if (cmd.includes('--list')) {
        // Rama NO existe → stdout vacío
        cb?.(null, '', '');
      } else {
        cb?.(null, "Switched to a new branch 'feat/nueva-feature'", '');
      }
      return {} as child_process.ChildProcess;
    }) as unknown as typeof child_process.exec);

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
