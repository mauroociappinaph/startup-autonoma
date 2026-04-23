import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * SandboxService
 * Provee una capa de abstracción para ejecutar comandos de forma segura
 * dentro de un contenedor Docker aislado.
 */
export class SandboxService {
  private static instance: SandboxService;
  private containerName = "startup-sandbox";

  private constructor() {}

  public static getInstance(): SandboxService {
    if (!SandboxService.instance) {
      SandboxService.instance = new SandboxService();
    }
    return SandboxService.instance;
  }

  /**
   * Ejecuta un comando en el sandbox.
   * @param command El comando a ejecutar (p.ej. 'npm test')
   * @param workingDir Directorio relativo dentro del monorepo
   */
  public async execute(command: string, workingDir: string = "."): Promise<{
    success: boolean;
    stdout: string;
    stderr: string;
    error?: string;
  }> {
    try {
      console.log(`[SANDBOX] Ejecutando: ${command} en ${workingDir}`);
      
      // Construimos el comando de docker exec
      // -w establece el directorio de trabajo
      // startup-sandbox es el nombre del contenedor definido en docker-compose
      const fullCommand = `docker exec -w /workspace/${workingDir} ${this.containerName} ${command}`;

      const { stdout, stderr } = await execAsync(fullCommand);

      return {
        success: true,
        stdout: stdout.trim(),
        stderr: stderr.trim()
      };
    } catch (error: unknown) {
      const err = error as { message: string; stdout?: string; stderr?: string };
      console.warn(`[SANDBOX] Error en ejecución: ${err.message}`);
      return {
        success: false,
        stdout: err.stdout?.trim() || "",
        stderr: err.stderr?.trim() || "",
        error: err.message
      };
    }
  }

  /**
   * Verifica si el sandbox está activo.
   */
  public async isReady(): Promise<boolean> {
    try {
      await execAsync(`docker ps -q -f name=${this.containerName}`);
      return true;
    } catch {
      return false;
    }
  }
}

export const sandboxService = SandboxService.getInstance();
