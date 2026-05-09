import { AgentStateType } from "@startup/shared";
import { codeResearcher } from "./codeResearcher.js";
import { AIMessage } from "@langchain/core/messages";
import { ProtocolHelper } from "@/helpers/protocol_helper.js";
import { services } from "@/services/index.js";
import { incrementIteration } from "@/helpers/index.js";
import { CodeResearcherInput } from "@/types/code-researcher.types.js";

/**
 * Nodo CodeResearcherWorker: Agente especializado en explorar y leer el código fuente.
 */
export async function code_researcher_node(state: AgentStateType) {
  services.logger.node("CODE RESEARCHER");

  const instruction = ProtocolHelper.getInstruction(state.messages);
  
  if (!instruction) {
    services.logger.error("No se encontró una instrucción válida para el Code Researcher.", "RESEARCHER");
    return {
      executive_summary: "Error: No se recibió una instrucción de investigación válida.",
      ...incrementIteration(state)
    };
  }

  const payload = instruction.payload as CodeResearcherInput;

  try {
    const result = await codeResearcher(payload as any);

    if (result.success) {
      services.logger.success(`Investigación [${result.action}] completada.`, "RESEARCHER");
      return {
        executive_summary: `Code Researcher ejecutó con éxito: ${result.action}.`,
        messages: [new AIMessage({
          content: `[RESEARCH_REPORT] Resultado de ${result.action}:\n${result.data}`,
          additional_kwargs: ProtocolHelper.packResult({
            status: "success",
            payload: result,
            reasoning: `La investigación de ${result.action} fue exitosa.`
          })
        })]
      };
    } else {
      services.logger.error(`Investigación [${result.action}] fallida: ${result.errorMessage}`, "RESEARCHER");
      return {
        executive_summary: `Error en Code Researcher: ${result.errorMessage}`,
        messages: [new AIMessage({
          content: `[RESEARCH_ERROR] Falló ${result.action}: ${result.errorMessage}`,
          additional_kwargs: ProtocolHelper.packResult({
            status: "failure",
            payload: result,
            reasoning: result.errorMessage || "Fallo desconocido en la investigación."
          })
        })]
      };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error("❌ Fallo crítico en el Nodo CodeResearcherWorker:", errorMessage);
    return {
      executive_summary: `Fallo crítico en Code Researcher: ${errorMessage}`,
    };
  }
}
