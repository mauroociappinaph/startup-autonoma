import { tool } from "@langchain/core/tools";
import { exec } from "child_process";
import path from "path";
import { 
  TestRunnerInputSchema, 
  TestRunnerOutput 
} from "@/types/software-tools.types.js";

/**
 * PROJECT_ROOT: Asumimos que el backend corre desde su carpeta, 
 * por lo que la raíz del monorepo está un nivel arriba.
 */
const PROJECT_ROOT = path.resolve(process.cwd(), "..");

/**
 * Herramienta TestRunner: Permite ejecutar tests en el monorepo.
 * Utiliza Turborepo para filtrar por paquete y provee resultados estructurados.
 */
export const test_runner = tool(
  async ({ package: pkg, filter }): Promise<TestRunnerOutput> => {
    // Construimos el comando de Turborepo
    let command = `npm test -- --filter=${pkg}`;
    if (filter) {
      command += ` ${filter}`;
    }

    console.log(`--- [TEST RUNNER] Ejecutando: ${command} ---`);

    return new Promise((resolve) => {
      exec(command, { cwd: PROJECT_ROOT }, (error, stdout, stderr) => {
        const success = !error;
        
        // Buscamos el resumen en stdout o stderr (Jest suele usar stderr para el reporte final)
        const combinedOutput = stdout + "\n" + stderr;
        
        // RegEx más robusta para pescar el resumen de Jest
        // Ejemplo: "Tests:       1 failed, 16 passed, 17 total"
        const summaryMatch = combinedOutput.match(/Tests:.*?\n/);
        
        let summary = "";
        if (summaryMatch) {
          summary = summaryMatch[0].trim();
        } else {
          summary = success ? "Todos los tests pasaron." : "Se detectaron fallos en la suite de tests.";
        }

        resolve({
          success,
          summary,
          stdout: stdout || undefined,
          stderr: stderr || undefined,
          commandExecuted: command
        });
      });
    });
  },
  {
    name: "test_runner",
    description: "Ejecuta suites de tests unitarios o de integración en un paquete del monorepo.",
    schema: TestRunnerInputSchema
  }
);
