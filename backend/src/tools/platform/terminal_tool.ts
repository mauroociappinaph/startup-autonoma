import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { sandboxService } from "../../services/sandboxService.js";

/**
 * Herramienta Terminal: Permite ejecutar comandos CLI seguros dentro de un Sandbox Docker.
 * Ideal para inspeccionar el estado del repo (git), listar dependencias (npm) o buscar archivos (grep/find).
 */
export const terminal_tool = tool(
  async ({ command, working_dir = ".", timeout = 60000 }) => {
    console.log(`--- [TERMINAL] Ejecutando: ${command} ---`);

    const result = await sandboxService.execute(command, working_dir, timeout);

    return {
      success: result.success,
      stdout: result.stdout,
      stderr: result.stderr,
      error: result.error
    };
  },
  {
    name: "terminal_tool",
    description: "Ejecuta comandos de consola seguros (git, npm, ls, grep, find, etc.) dentro de un entorno Docker aislado.",
    schema: z.object({
      command: z.string().describe("El comando a ejecutar (ej: 'git status', 'ls -la')."),
      working_dir: z.string().optional().describe("Directorio relativo donde ejecutar el comando."),
      timeout: z.number().optional().describe("Tiempo máximo de espera en milisegundos (default: 60000).")
    })
  }
);
