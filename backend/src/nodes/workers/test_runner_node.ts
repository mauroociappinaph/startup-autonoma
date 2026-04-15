import { AgentStateType } from "@/types/state.types.js";
import { test_runner } from "@/tools/domain/software/testRunner.js";
import { AIMessage } from "@langchain/core/messages";
import { TestRunnerInput } from "@/types/software-tools.types.js";

/**
 * Nodo TestRunner: Brazo ejecutor de validaciones técnicas.
 * Ejecuta suites de tests y devuelve el reporte estructurado al Chief.
 */
export async function test_runner_node(state: AgentStateType) {
  console.log("--- EJECUTANDO NODO TEST RUNNER ---");

  // Buscamos la instrucción para el Test Runner en los mensajes
  const lastMessage = state.messages[state.messages.length - 1];
  
  if (!lastMessage || !lastMessage.additional_kwargs?.test_instruction) {
    console.error("❌ No se encontró una instrucción válida para el Test Runner.");
    return {
      executive_summary: "Error: No se recibió una instrucción de test válida.",
    };
  }

  const testInstruction = lastMessage.additional_kwargs.test_instruction as TestRunnerInput;

  try {
    const result = await test_runner.invoke(testInstruction);

    if (result.success) {
      console.log(`✅ Tests en [${testInstruction.package}] pasaron: ${result.summary}`);
      return {
        executive_summary: `Validación exitosa en ${testInstruction.package}: ${result.summary}`,
        messages: [new AIMessage({
          content: `[TEST_REPORT] ÉXITO: ${result.summary}`,
          additional_kwargs: { test_result: result }
        })]
      };
    } else {
      console.error(`❌ Tests en [${testInstruction.package}] fallaron: ${result.summary}`);
      return {
        executive_summary: `Validación fallida en ${testInstruction.package}: ${result.summary}`,
        messages: [new AIMessage({
          content: `[TEST_REPORT] FALLO: ${result.summary}`,
          additional_kwargs: { test_result: result }
        })]
      };
    }
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any;
    console.error("❌ Fallo crítico en el Nodo TestRunner:", err.message);
    return {
      executive_summary: `Fallo crítico en Test Runner: ${err.message}`,
    };
  }
}
