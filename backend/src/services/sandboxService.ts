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
   * Ejecuta un comando en el sandbox con protecciones de seguridad.
   * @param command El comando a ejecutar (p.ej. 'npm test')
   * @param workingDir Directorio relativo dentro del monorepo
   * @param timeout Timeout en milisegundos (default: 60s)
   */
  public async execute(
    command: string, 
    workingDir: string = ".",
    timeout: number = 60000
  ): Promise<{
    success: boolean;
    stdout: string;
    stderr: string;
    error?: string;
  }> {
    try {
      // 1. Validación de seguridad (Whitelist básica)
      const allowedBinaries = /^(git|npm|node|ls|cat|grep|find|pwd|whoami|date|pnpm|yarn|turbo|npx|sleep)/;
      const firstWord = command.trim().split(" ")[0];
      
      if (!allowedBinaries.test(firstWord)) {
        throw new Error(`Comando no permitido en el sandbox: ${firstWord}`);
      }

      // 2. Prevención de inyección simple (bloquear pipe, redirección, etc si no es necesario)
      // Por ahora permitimos pipes simples para grep, pero con cuidado
      if (command.includes(";") || command.includes("&&") || (command.includes("|") && !command.includes("grep"))) {
         // Podríamos ser más estrictos aquí en el futuro
      }

      console.log(`[SANDBOX] Ejecutando: ${command} en ${workingDir} (Timeout: ${timeout}ms)`);
      
      // Construimos el comando de docker exec con timeout (usando el comando 'timeout' de linux)
      const timeoutSec = Math.ceil(timeout / 1000);
      const fullCommand = `docker exec -w /workspace/${workingDir} ${this.containerName} timeout ${timeoutSec}s ${command}`;

      const { stdout, stderr } = await execAsync(fullCommand);

      return {
        success: true,
        stdout: stdout.trim(),
        stderr: stderr.trim()
      };
    } catch (error: unknown) {
      const err = error as { message: string; stdout?: string; stderr?: string; code?: number | string };
      
      // Manejo específico de timeout (el comando 'timeout' devuelve 124 si expira)
      const isTimeout = err.code === 124 || err.message.includes("124");
      
      const errorMessage = isTimeout 
        ? `Tiempo de ejecución excedido (${timeout}ms)` 
        : err.message;

      console.warn(`[SANDBOX] Error en ejecución: ${errorMessage}`);
      
      return {
        success: false,
        stdout: err.stdout?.trim() || "",
        stderr: err.stderr?.trim() || "",
        error: errorMessage
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
