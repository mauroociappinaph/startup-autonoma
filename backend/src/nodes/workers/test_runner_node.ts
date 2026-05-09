import { AgentStateType } from "@startup/shared";
import { test_runner } from "@/tools/domain/software/testRunner.js";
import { AIMessage } from "@langchain/core/messages";
import { ProtocolHelper } from "@/helpers/protocol_helper.js";
import { incrementIteration } from "@/helpers/index.js";
import { services } from "@/services/index.js";
import { TestRunnerInput } from "@/types/software-tools.types.js";

/**
 * Nodo TestRunner: Brazo ejecutor de validaciones técnicas.
 */
export async function test_runner_node(state: AgentStateType) {
  services.logger.node("TEST RUNNER");

  const instruction = ProtocolHelper.getInstruction(state.messages);
  
  if (!instruction) {
    services.logger.error("No se encontró una instrucción válida para el Test Runner.", "TEST_NODE");
    return {
      executive_summary: "Error: No se recibió una instrucción de test válida.",
      ...incrementIteration(state)
    };
  }

  const testInstruction = instruction.payload as TestRunnerInput;

  try {
    const result = await test_runner.invoke(testInstruction);

    if (result.success) {
      services.logger.success(`Tests en [${testInstruction.package}] pasaron: ${result.summary}`, "TEST_NODE");
      return {
        executive_summary: `Validación exitosa en ${testInstruction.package}: ${result.summary}`,
        ...incrementIteration(state),
        messages: [new AIMessage({
          content: `[TEST_REPORT] ÉXITO: ${result.summary}`,
          additional_kwargs: ProtocolHelper.packResult({
            status: "success",
            payload: result,
            reasoning: `La suite de tests en ${testInstruction.package} pasó correctamente.`
          })
        })]
      };
    } else {
      services.logger.error(`Tests en [${testInstruction.package}] fallaron: ${result.summary}`, "TEST_NODE");
      return {
        executive_summary: `Validación fallida en ${testInstruction.package}: ${result.summary}`,
        ...incrementIteration(state),
        messages: [new AIMessage({
          content: `[TEST_REPORT] FALLO: ${result.summary}`,
          additional_kwargs: ProtocolHelper.packResult({
            status: "failure",
            payload: result,
            reasoning: `Tests fallidos: ${result.summary}`
          })
        })]
      };
    }
  } catch (err: any) {
    services.logger.error(`Fallo crítico en el Nodo TestRunner: ${err.message}`, "TEST_NODE");
    return {
      executive_summary: `Fallo crítico en Test Runner: ${err.message}`,
      ...incrementIteration(state),
      messages: [new AIMessage({
        content: `[TEST_CRITICAL_ERROR] ${err.message}`,
        additional_kwargs: ProtocolHelper.packResult({
          status: "error",
          payload: { error: err.message },
          reasoning: "Excepción crítica durante la ejecución de tests."
        })
      })]
    };
  }
}
