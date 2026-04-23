import { AgentStateType } from "@/types/state.types.js";
import { test_runner } from "@/tools/domain/software/testRunner.js";
import { AIMessage } from "@langchain/core/messages";
import { TestRunnerInput } from "@/types/software-tools.types.js";
import { SacredLogger } from "@/helpers/logger.js";

/**
 * Nodo TestRunner: Brazo ejecutor de validaciones técnicas.
 * Ejecuta suites de tests y devuelve el reporte estructurado al Chief.
 */
export async function test_runner_node(state: AgentStateType) {
  SacredLogger.node("TEST RUNNER");

  // Buscamos la instrucción para el Test Runner en los mensajes
  const lastMessage = state.messages[state.messages.length - 1];
  
  if (!lastMessage || !lastMessage.additional_kwargs?.test_instruction) {
    SacredLogger.error("No se encontró una instrucción válida para el Test Runner.", "TEST_NODE");
    return {
      executive_summary: "Error: No se recibió una instrucción de test válida.",
    };
  }

  const testInstruction = lastMessage.additional_kwargs.test_instruction as TestRunnerInput;

  try {
    const result = await test_runner.invoke(testInstruction);

    if (result.success) {
      SacredLogger.success(`Tests en [${testInstruction.package}] pasaron: ${result.summary}`, "TEST_NODE");
      return {
        executive_summary: `Validación exitosa en ${testInstruction.package}: ${result.summary}`,
        completed_steps: ["test_operation"],
        iteration_count: 1,
        next_node: state.active_chief || "ceo",
        messages: [new AIMessage({
          content: `[TEST_REPORT] ÉXITO: ${result.summary}`,
          additional_kwargs: { test_result: result }
        })]
      };
    } else {
      SacredLogger.error(`Tests en [${testInstruction.package}] fallaron: ${result.summary}`, "TEST_NODE");
      return {
        executive_summary: `Validación fallida en ${testInstruction.package}: ${result.summary}`,
        iteration_count: 1,
        next_node: state.active_chief || "ceo",
        messages: [new AIMessage({
          content: `[TEST_REPORT] FALLO: ${result.summary}`,
          additional_kwargs: { test_result: result }
        })]
      };
    }
  } catch (error: unknown) {
    const err = error as Error;
    SacredLogger.error(`Fallo crítico en el Nodo TestRunner: ${err.message}`, "TEST_NODE");
    return {
      executive_summary: `Fallo crítico en Test Runner: ${err.message}`,
    };
  }
}
