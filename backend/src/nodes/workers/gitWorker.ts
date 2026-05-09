import child_process from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import {
  GitCommandSchema,
  GitCommandInput,
  GitWorkerResponse 
} from '@/types/git-worker.types.js';
import { services } from '@/services/index.js';

/**
 * Helper interno para ejecutar comandos de shell como promesas.
 *
 * USA child_process.exec como referencia dinámica del objeto importado,
 * NO como named import, para permitir el mockeo con jest.spyOn en tests.
 */
function runCommand(cmd: string, cwd: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    child_process.exec(cmd, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout: stdout || '', stderr: stderr || '' });
      } else {
        resolve({ stdout: stdout || '', stderr: stderr || '' });
      }
    });
  });
}

/**
 * Git Worker: Brazo ejecutor de operaciones de control de versiones.
 * Traduce intenciones de alto nivel (acciones) en comandos Git reales.
 * Implementa la Ley #7: Idempotencia Obligatoria.
 */
export async function gitWorker(commandInput: GitCommandInput): Promise<GitWorkerResponse> {
  const { payload, repoPath } = GitCommandSchema.parse(commandInput);
  const targetRepoPath = repoPath || process.cwd();

  services.logger.info(`Ejecutando acción: ${payload.action}`, "GIT_WORKER");

  const actionName = payload.action;

  try {
    // --- Acción: commit-all (con idempotencia y extracción de commitId) ---
    if (payload.action === 'commit-all') {
      const { stdout: status } = await runCommand('git status --porcelain', targetRepoPath);
      if (!status || !status.trim()) {
        services.logger.info('Nada para commitear, el árbol de trabajo está limpio.', "GIT");
        return { success: true, action: actionName, stdout: 'Nothing to commit, working tree clean' };
      }

      const { stdout } = await runCommand(`git add . && git commit -m "${payload.message}"`, targetRepoPath);
      const response: GitWorkerResponse = { success: true, action: actionName, stdout: stdout || undefined };

      // Extracción robusta del commit ID desde la salida estándar de git
      const patterns = [
        /\[[\w/-]+\s+([a-f0-9]{7,40})\]/, // [branch abc1234] o [feat/algo abc1234]
        /\s([a-f0-9]{7,40})\]/,            //  abc1234]
        /([a-f0-9]{7,40})/                 // Fallback: cualquier hash hex de 7+ chars
      ];
      for (const pattern of patterns) {
        const match = pattern.exec(stdout || '');
        if (match) {
          response.commitId = match[1] || match[0];
          break;
        }
      }

      services.logger.success(`Acción ${actionName} completada. CommitId: ${response.commitId}`, "GIT");
      return response;
    }

    // --- Acción: clone (con idempotencia) ---
    if (payload.action === 'clone') {
      try {
        const stats = await fs.stat(path.join(targetRepoPath, '.git'));
        if (stats.isDirectory()) {
          services.logger.info('El repositorio ya está clonado en este directorio.', "GIT");
          return { success: true, action: actionName, stdout: 'Already cloned' };
        }
      } catch {
        // No existe .git, podemos clonar
      }

      const token = process.env.GITHUB_TOKEN;
      let authenticatedUrl = payload.repoUrl;
      if (token && payload.repoUrl.includes('github.com')) {
        authenticatedUrl = payload.repoUrl.replace('https://', `https://${token}@`);
      }
      const { stdout } = await runCommand(`git clone ${authenticatedUrl} .`, targetRepoPath);
      return { success: true, action: actionName, stdout: stdout || undefined };
    }

    // --- Construcción del comando para acciones simples ---
    let gitCommand = '';

    switch (payload.action) {
      case 'raw':
        gitCommand = `git ${payload.command} ${payload.args.join(' ')}`;
        break;

      case 'create-branch': {
        // IDEMPOTENCIA: Verificar si la rama ya existe antes de crearla
        try {
          const { stdout: branchList } = await runCommand(`git branch --list ${payload.branchName}`, targetRepoPath);
          if (branchList && branchList.trim()) {
            services.logger.info(`La rama '${payload.branchName}' ya existe. Cambiando a ella...`, "GIT");
            gitCommand = `git checkout ${payload.branchName}`;
          } else {
            gitCommand = `git checkout ${payload.baseBranch} && git pull origin ${payload.baseBranch} && git checkout -b ${payload.branchName}`;
          }
        } catch {
          gitCommand = `git checkout -b ${payload.branchName}`;
        }
        break;
      }

      case 'sync-develop':
        gitCommand = `git checkout develop && git pull origin develop`;
        break;

      case 'pull':
        gitCommand = `git pull`;
        break;

      case 'push': {
        const branch = payload.branchName || '';
        gitCommand = `git push origin ${branch}`.trim();
        break;
      }

      default:
        // @ts-expect-error - Exhaustive check fallback
        throw new Error(`Acción no soportada: ${payload.action}`);
    }

    const maskedCommand = gitCommand.replace(/https:\/\/.*@/, 'https://[TOKEN]@');
    services.logger.info(`Ejecutando: ${maskedCommand} en ${targetRepoPath}`, "GIT");

    const { stdout, stderr } = await runCommand(gitCommand, targetRepoPath);

    const response: GitWorkerResponse = {
      success: true,
      action: actionName,
      stdout: stdout || undefined,
      stderr: stderr || undefined,
    };

    if (payload.action === 'create-branch') {
      response.branchName = payload.branchName;
    }

    services.logger.success(`Acción ${actionName} completada con éxito.`, "GIT");
    return response;

  } catch (error: unknown) {
    const err = error as Error & { stderr?: string; stdout?: string; error?: { message: string } };
    services.logger.error(`Falló la acción ${actionName}: ${err.message || 'Error desconocido'}`, "GIT");
    return {
      success: false,
      action: actionName,
      errorMessage: err.error?.message || err.message || 'Error ejecutando comando',
      stderr: err.stderr || undefined,
      stdout: err.stdout || undefined,
    };
  }
}
