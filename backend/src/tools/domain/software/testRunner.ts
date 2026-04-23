import { tool } from "@langchain/core/tools";
import { sandboxService } from "@/services/sandboxService.js";
import { 
  TestRunnerInputSchema, 
  TestRunnerOutput 
} from "@/types/software-tools.types.js";

/**
 * Herramienta TestRunner: Permite ejecutar tests en el monorepo.
 * Utiliza Turborepo dentro de un SANDBOX DOCKER para aislamiento total.
 */
export const test_runner = tool(
  async ({ package: pkg, filter }): Promise<TestRunnerOutput> => {
    // Construimos el comando de Turborepo
    let testCmd = `npm test -- --filter=${pkg}`;
    if (filter) {
      testCmd += ` ${filter}`;
    }

    console.log(`--- [TEST RUNNER] Ejecutando en SANDBOX: ${testCmd} ---`);

    // Ejecutamos vía SandboxService (el sandbox monta la raíz en /workspace)
    const result = await sandboxService.execute(testCmd);
    
    const combinedOutput = result.stdout + "\n" + result.stderr;
    
    // RegEx para pescar el resumen de Jest
    const summaryMatch = combinedOutput.match(/Tests:.*?\n/);
    
    let summary = "";
    if (summaryMatch) {
      summary = summaryMatch[0].trim();
    } else {
      summary = result.success ? "Todos los tests pasaron." : "Se detectaron fallos en la suite de tests.";
    }

    return {
      success: result.success,
      summary,
      stdout: result.stdout || undefined,
      stderr: result.stderr || undefined,
      commandExecuted: testCmd
    };
  },
  {
    name: "test_runner",
    description: "Ejecuta suites de tests unitarios o de integración en un paquete del monorepo dentro de un sandbox seguro.",
    schema: TestRunnerInputSchema
  }
);
