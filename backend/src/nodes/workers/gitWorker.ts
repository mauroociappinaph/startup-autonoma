import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import {
  GitCommandSchema,
  GitCommandInput,
  GitWorkerResponse
} from '@/types/git-worker.types.js';

const execAsync = promisify(exec);

/**
 * Git Worker: Brazo ejecutor de operaciones de control de versiones.
 * Traduce intenciones de alto nivel (acciones) en comandos Git reales.
 * Implementa la Ley #7: Idempotencia Obligatoria.
 */
export async function gitWorker(commandInput: GitCommandInput): Promise<GitWorkerResponse> {
  const { payload, repoPath } = GitCommandSchema.parse(commandInput);
  const targetRepoPath = repoPath || process.cwd();
  
  console.log(`--- [GIT WORKER] Ejecutando acción: ${payload.action} ---`);

  let gitCommand = '';
  const actionName = payload.action;

  try {
    switch (payload.action) {
      case 'raw':
        gitCommand = `git ${payload.command} ${payload.args.join(' ')}`;
        break;

      case 'create-branch': {
        // IDEMPOTENCIA: Verificar si la rama ya existe
        try {
          const { stdout: branchList } = await execAsync(`git branch --list ${payload.branchName}`, { cwd: targetRepoPath });
          if (branchList.trim()) {
            console.log(`ℹ️ [GIT] La rama '${payload.branchName}' ya existe. Cambiando a ella...`);
            gitCommand = `git checkout ${payload.branchName}`;
          } else {
            gitCommand = `git checkout ${payload.baseBranch} && git pull origin ${payload.baseBranch} && git checkout -b ${payload.branchName}`;
          }
        } catch (e) {
          gitCommand = `git checkout -b ${payload.branchName}`;
        }
        break;
      }

      case 'commit-all': {
        // IDEMPOTENCIA: Verificar si hay cambios antes de commitear
        const { stdout: status } = await execAsync('git status --porcelain', { cwd: targetRepoPath });
        if (!status || !status.trim()) {
          console.log('ℹ️ [GIT] Nada para commitear, el árbol de trabajo está limpio.');
          return { success: true, action: actionName, stdout: 'Nothing to commit, working tree clean' };
        }
        gitCommand = `git add . && git commit -m "${payload.message}"`;
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

      case 'clone': {
        // IDEMPOTENCIA: Verificar si el repo ya está clonado
        try {
          const stats = await fs.stat(path.join(targetRepoPath, '.git'));
          if (stats.isDirectory()) {
            console.log('ℹ️ [GIT] El repositorio ya está clonado en este directorio.');
            return { success: true, action: actionName, stdout: 'Already cloned' };
          }
        } catch (e) {
          // No existe .git, podemos clonar
        }

        const token = process.env.GITHUB_TOKEN;
        let authenticatedUrl = payload.repoUrl;
        
        if (token && payload.repoUrl.includes('github.com')) {
          authenticatedUrl = payload.repoUrl.replace('https://', `https://${token}@`);
        }
        
        gitCommand = `git clone ${authenticatedUrl} .`;
        break;
      }

      default:
        // @ts-expect-error - Exhaustive check fallback
        throw new Error(`Acción no soportada: ${payload.action}`);
    }

    // Enmascarar el token en los logs por seguridad
    const maskedCommand = gitCommand.replace(/https:\/\/.*@/, 'https://[TOKEN]@');
    console.log(`🚀 Ejecutando: ${maskedCommand} en ${targetRepoPath}`);
    
    // Promesa manual para evitar problemas con promisify y mocks de Jest
    const { stdout, stderr } = await new Promise<{ stdout: string, stderr: string }>((resolve, reject) => {
      exec(gitCommand, { cwd: targetRepoPath }, (error, out, err) => {
        if (error) {
          reject({ error, stdout: out, stderr: err });
        } else {
          resolve({ stdout: out, stderr: err });
        }
      });
    });

    const response: GitWorkerResponse = {
      success: true,
      action: actionName,
      stdout: stdout || undefined,
      stderr: stderr || undefined,
    };

    // Extracción de Commit ID (robusta)
    if (payload.action === 'commit-all' && stdout) {
      const patterns = [
        /\[\w+\s+([a-f0-9]{7,40})\]/, // [branch abc1234]
        /\s([a-f0-9]{7,40})\]/,       //  abc1234]
        /([a-f0-9]{7,40})/            // Cualquier hash hex de 7+ chars
      ];

      for (const pattern of patterns) {
        const match = pattern.exec(stdout);
        if (match) {
          response.commitId = match[1] || match[0];
          break;
        }
      }
    }

    if (payload.action === 'create-branch') {
      response.branchName = payload.branchName;
    }

    console.log(`✅ Acción ${actionName} completada con éxito.`);
    return response;

  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any;
    console.error(`❌ Falló la acción ${actionName}: ${err.message || 'Error desconocido'}`);
    return {
      success: false,
      action: actionName,
      errorMessage: err.error?.message || err.message || 'Error ejecutando comando',
      stderr: err.stderr || undefined,
      stdout: err.stdout || undefined,
    };
  }
}
