import { exec } from 'child_process';
import {
  GitCommandSchema,
  GitCommandInput,
  GitWorkerResponse
} from '@/types/git-worker.types.js';

/**
 * Git Worker: Brazo ejecutor de operaciones de control de versiones.
 * Traduce intenciones de alto nivel (acciones) en comandos Git reales.
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

      case 'push': {
        const branch = payload.branchName || ''; 
        gitCommand = `git push origin ${branch}`.trim();
        break;
      }

      default:
        throw new Error(`Acción no soportada: ${(payload as any).action}`);
    }

    console.log(`🚀 Ejecutando: ${gitCommand} en ${targetRepoPath}`);
    
    // Promesa manual para evitar problemas con promisify y mocks de Jest
    const { stdout, stderr } = await new Promise<{ stdout: string, stderr: string }>((resolve, reject) => {
      exec(gitCommand, { cwd: targetRepoPath }, (error, stdout, stderr) => {
        if (error) {
          reject({ error, stdout, stderr });
        } else {
          resolve({ stdout, stderr });
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
        const match = stdout.match(pattern);
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

  } catch (error: any) {
    console.error(`❌ Falló la acción ${actionName}: ${error.message || 'Error desconocido'}`);
    return {
      success: false,
      action: actionName,
      errorMessage: error.error?.message || error.message || 'Error ejecutando comando',
      stderr: error.stderr || undefined,
      stdout: error.stdout || undefined,
    };
  }
}
