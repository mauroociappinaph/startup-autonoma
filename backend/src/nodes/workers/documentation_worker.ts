import { AgentStateType } from "@/types/state.types.js";
import { LLMService } from "@/services/llmService.js";
import { SystemMessage, AIMessage } from "@langchain/core/messages";
import { TelemetryService } from "@/services/telemetryService.js";
import { AuditService } from "@/services/auditService.js";
import { DocumentationWorkerSchema } from "@/contracts/documentation_worker.js";

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
    const { data: response, usage, cost, latency } = await LLMService.getStructuredData(
      { type: "flow", temperature: 0 },
      [system_prompt, ...state.messages],
      DocumentationWorkerSchema
    );

    const projectId = state.project_context?.projectId || "unknown";

    // 1. Telemetría
    await TelemetryService.recordMetric(projectId, {
      node: "Documentation Worker",
      model: "gpt-4o",
      latency,
      usage
    });

    // 2. Auditoría
    await AuditService.logDecision(projectId, {
      agent: "Documentation Worker",
      decision: "update_docs",
      reasoning: response.reasoning,
      metadata: {
        files: response.files_updated,
        summary: response.summary_of_changes
      }
    });

    console.log(`📝 Documentation Sync: ${response.summary_of_changes}`);

    const updates: Partial<AgentStateType> = {
      executive_summary: response.reasoning,
      reasoning: response.reasoning,
      iteration_count: 1,
      token_usage: usage,
      total_cost_usd: cost,
      messages: state.messages.concat([new AIMessage({
        content: `[DOCUMENTATION_WORKER_RESULT] Updated: ${response.files_updated.join(", ")}
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
