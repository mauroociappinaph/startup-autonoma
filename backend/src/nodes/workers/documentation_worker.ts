import { AgentStateType } from "@startup/shared";
import { services } from "@/services/index.js";
import { SystemMessage, AIMessage } from "@langchain/core/messages";
import { DocumentationWorkerSchema } from "@startup/shared";
import { prepareNodeUpdate } from "@/helpers/index.js";

/**
 * DocumentationWorker: El Escriba de la Startup.
 * Asegura que el rastro de conocimiento (AGENTS.md, docs/) esté siempre al día.
 */
export async function documentation_worker_node(state: AgentStateType): Promise<Partial<AgentStateType>> {
  console.log("\n--- EJECUTANDO NODO DOCUMENTATION WORKER ---");

  const system_prompt = new SystemMessage(`
    Eres el Documentalista de una Startup Autónoma.
    Tu misión es mantener la "Fuente de Verdad" (AGENTS.md, README.md, GEMINI.md y /docs) actualizada.
    
    ESTRUCTURA DE RAZONAMIENTO:
    1. <thought>: Analiza qué partes del conocimiento necesitan actualización.
    2. <plan>: Pasos para sincronizar los archivos de documentación.
    3. <verification>: Confirmación de que la fuente de verdad (Source of Truth) es consistente.

    REGLA: Tu documentación debe ser clara, técnica y seguir el formato Markdown existente.
  `);

  try {
    const { data: response, usage, cost, latency, model } = await services.llm.getStructuredData(
      { type: "flow", temperature: 0 },
      [system_prompt, ...state.messages],
      DocumentationWorkerSchema
    );

    console.log(`📝 Documentation Sync: ${response.summary_of_changes}`);

    const metricsUpdate = await prepareNodeUpdate(state, {
      nodeName: "Documentation Worker",
      model: model || "unknown",
      usage,
      latency,
      cost,
      decision: "update_docs",
      reasoning: response.reasoning
    });

    const updates: Partial<AgentStateType> = {
      ...metricsUpdate,
      executive_summary: response.reasoning,
      messages: state.messages.concat([new AIMessage({
        content: `[DOCUMENTATION_WORKER_RESULT] [TASK_COMPLETED]
Updated: ${response.files_updated.join(", ")}
Summary: ${response.summary_of_changes}`,
      })])
    };

    return updates;
  } catch (error) {
    console.error("❌ Error en el Nodo Documentation Worker:", error);
    return {
      executive_summary: "Error crítico en el proceso de documentación.",
    };
  }
}
