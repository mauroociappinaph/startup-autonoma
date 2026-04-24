import { AgentStateType } from "@startup/shared";
import { codeResearcher } from "./codeResearcher.js";
import { AIMessage } from "@langchain/core/messages";
import { CodeResearcherInput } from "@/types/code-researcher.types.js";

/**
 * Nodo CodeResearcherWorker: Agente especializado en explorar y leer el código fuente.
 * Cumple con la Ley #8 (Reasoning-First) al esperar una justificación técnica previa.
 */
export async function code_researcher_node(state: AgentStateType) {
  console.log("--- [NODE] EJECUTANDO CODE RESEARCHER WORKER ---");

  const lastMessage = state.messages[state.messages.length - 1];
  
  if (!lastMessage || !lastMessage.additional_kwargs?.code_researcher_instruction) {
    console.error("❌ No se encontró una instrucción válida para el Code Researcher.");
    return {
      executive_summary: "Error: No se recibió una instrucción de investigación válida.",
    };
  }

  const instruction = lastMessage.additional_kwargs.code_researcher_instruction as CodeResearcherInput;

  try {
    const result = await codeResearcher(instruction);

    if (result.success) {
      console.log(`✅ Investigación [${result.action}] completada.`);
      return {
        executive_summary: `Code Researcher ejecutó con éxito: ${result.action}.`,
        iteration_count: 1,
        next_node: state.active_chief || "ceo",
        messages: [new AIMessage({
          content: `[RESEARCH_REPORT] Resultado de ${result.action}:\n${result.data}`,
          additional_kwargs: { research_result: result }
        })]
      };
    } else {
      console.error(`❌ Investigación [${result.action}] fallida: ${result.errorMessage}`);
      return {
        executive_summary: `Error en Code Researcher: ${result.errorMessage}`,
        iteration_count: 1,
        next_node: state.active_chief || "ceo",
        messages: [new AIMessage({
          content: `[RESEARCH_ERROR] Falló ${result.action}: ${result.errorMessage}`,
          additional_kwargs: { research_result: result }
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
