import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import { GitCommandSchema, GitWorkerResponseSchema, GitCommandInput } from '@/types/gitWorker.js';
import path from 'path';

const execAsync = promisify(exec);

/**
 * Git Worker: Ejecuta comandos Git en el repositorio.
 * Se comunica con el Software Chief para realizar operaciones de control de versiones.
 */
export async function gitWorker(commandInput: GitCommandInput): Promise<z.infer<typeof GitWorkerResponseSchema>> {
  console.log(`--- EJECUTANDO GIT WORKER ---`);
  console.log(`Comando recibido: ${commandInput.command} con argumentos: ${commandInput.args}`);

  try {
    // Validamos la entrada antes de proceder
    const validatedInput = GitCommandSchema.parse(commandInput);
    const { command, args, repoPath, isolationId } = validatedInput;

    // Determinamos la ruta del repositorio. Si no se proporciona, usamos el directorio actual.
    // Nota: La gestión de worktrees con isolationId se simplifica por ahora, asumiendo ejecución en el directorio base o uno especificado.
    const targetRepoPath = repoPath || process.cwd();
    const gitCommand = `git \${command} \${args.join(' ')}`;

    console.log(`Ejecutando: ${gitCommand} en ${targetRepoPath}`);

    const { stdout, stderr } = await execAsync(gitCommand, { cwd: targetRepoPath });

    console.log(`✅ Comando Git ejecutado exitosamente.`);
    console.log(`Stdout:
${stdout}`);
    if (stderr) {
      console.warn(`Stderr:
${stderr}`);
    }

    // Preparamos la respuesta basada en el comando ejecutado
    const response: z.infer<typeof GitWorkerResponseSchema> = {
      success: true,
      stdout: stdout || undefined,
      stderr: stderr || undefined,
    };

    if (command === 'commit' && stdout) {
      // Intentamos extraer el hash del commit si es un commit
      const commitMatch = stdout.match(/\[([a-f0-9]+)\]/);
      if (commitMatch && commitMatch[1]) {
        response.commitId = commitMatch[1];
      }
    }
    
    // Podríamos añadir lógica para detectar el nombre de la branch si el comando fue 'checkout' o 'branch'

    return response;

  } catch (error: any) {
    console.error(`❌ Error ejecutando comando Git (\${commandInput.command}): ${error.message}`);
    return {
      success: false,
      errorMessage: error.message,
      stderr: error.stderr || undefined,
      stdout: error.stdout || undefined,
    };
  }
}
