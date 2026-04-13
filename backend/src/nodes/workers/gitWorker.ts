import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import { 
  GitCommandSchema, 
  GitWorkerResponseSchema, 
  GitCommandInput,
  GitWorkerResponse
} from '@/types/gitWorker.js';

/**
 * Git Worker: Brazo ejecutor de operaciones de control de versiones.
 * Traduce intenciones de alto nivel (acciones) en comandos Git reales.
 */
export async function gitWorker(commandInput: GitCommandInput): Promise<GitWorkerResponse> {
  // Promisificamos exec adentro para que los mocks de los tests funcionen correctamente
  const execAsync = promisify(exec);
  
  const { payload, repoPath } = GitCommandSchema.parse(commandInput);
  const targetRepoPath = repoPath || process.cwd();
  
  console.log(`--- [GIT WORKER] Ejecutando acción: ${payload.action} ---`);

  let gitCommand = '';
  let actionName = payload.action;

  try {
    switch (payload.action) {
      case 'raw':
        gitCommand = `git ${payload.command} ${payload.args.join(' ')}`;
        break;

      case 'create-branch':
        gitCommand = `git checkout ${payload.baseBranch} && git pull origin ${payload.baseBranch} && git checkout -b ${payload.branchName}`;
        break;

      case 'commit-all':
        gitCommand = `git add . && git commit -m "${payload.message}"`;
        break;

      case 'sync-develop':
        gitCommand = `git checkout develop && git pull origin develop`;
        break;

      case 'pull':
        gitCommand = `git pull`;
        break;

      case 'push':
        const branch = payload.branchName || ''; 
        gitCommand = `git push origin ${branch}`.trim();
        break;

      default:
        throw new Error(`Acción no soportada: ${(payload as any).action}`);
    }

    console.log(`🚀 Ejecutando: ${gitCommand} en ${targetRepoPath}`);
    
    const { stdout, stderr } = await execAsync(gitCommand, { cwd: targetRepoPath });

    const response: GitWorkerResponse = {
      success: true,
      action: actionName,
      stdout: stdout || undefined,
      stderr: stderr || undefined,
    };

    if (payload.action === 'commit-all' && stdout) {
      const commitMatch = stdout.match(/\s([a-f0-9]{7,40})\]/);
      if (commitMatch) response.commitId = commitMatch[1];
    }

    if (payload.action === 'create-branch') {
      response.branchName = payload.branchName;
    }

    console.log(`✅ Acción ${actionName} completada con éxito.`);
    return response;

  } catch (error: any) {
    console.error(`❌ Falló la acción ${actionName}: ${error.message}`);
    return {
      success: false,
      action: actionName,
      errorMessage: error.message,
      stderr: error.stderr || undefined,
      stdout: error.stdout || undefined,
    };
  }
}
