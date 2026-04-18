import { AgentStateType } from "@/types/state.types.js";
import { LLMService } from "@/services/llmService.js";
import { SystemMessage, AIMessage } from "@langchain/core/messages";
import { TelemetryService } from "@/services/telemetryService.js";
import { AuditService } from "@/services/auditService.js";
import { ReviewWorkerSchema } from "@/contracts/review_worker.js";

/**
 * ReviewWorker: El Sensor de Calidad Técnica.
 * Analiza el rastro de cambios y el progreso para asegurar que se cumplen las Leyes Sagradas.
 */
export async function review_worker_node(state: AgentStateType): Promise<Partial<AgentStateType>> {
  console.log("\n--- EJECUTANDO NODO REVIEW WORKER ---");

  const system_prompt = new SystemMessage(`
    Eres un Senior Software Engineer realizando un Peer Review a un compañero Agente.
    Tu misión es validar que el código propuesto o las acciones técnicas sean de alta calidad.
    
    TUS CRITERIOS DE REVISIÓN:
    1. SRP (Single Responsibility Principle): ¿Cada archivo hace una sola cosa?
    2. DRY (Don't Repeat Yourself): ¿Hay lógica duplicada?
    3. SOLID: ¿Se respetan los principios de diseño?
    4. Tipado Estricto: ¿Hay uso de 'any' innecesario?
    5. Seguridad: ¿Hay vulnerabilidades evidentes?
    
    LEY SAGRADA: Sé riguroso. Si el código no es excelente, responde 'needs_changes'.
  `);

  try {
    const { data: response, usage, cost, latency } = await LLMService.getStructuredData(
      { type: "smart", temperature: 0 },
      [system_prompt, ...state.messages],
      ReviewWorkerSchema
    );

    const projectId = state.project_context?.projectId || "unknown";

    // 1. Telemetría
    await TelemetryService.recordMetric(projectId, {
      node: "Review Worker",
      model: "gpt-4o",
      latency,
      usage
    });

    // 2. Auditoría
    await AuditService.logDecision(projectId, {
      agent: "Review Worker",
      decision: response.status,
      reasoning: response.reasoning,
      metadata: {
        comments: response.review_comments,
        suggestions: response.suggestions
      }
    });

    console.log(`🧐 Review Result: ${response.status} -> ${response.reasoning}`);

    const updates: Partial<AgentStateType> = {
      executive_summary: response.reasoning,
      reasoning: response.reasoning,
      iteration_count: 1,
      token_usage: usage,
      total_cost_usd: cost,
      messages: state.messages.concat([new AIMessage({
        content: `[REVIEW_WORKER_RESULT] Status: ${response.status}
Reasoning: ${response.reasoning}
Comments: ${response.review_comments.join(", ")}`,
      })])
    };

    return updates;
  } catch (error) {
    console.error("❌ Error en el Nodo Review Worker:", error);
    return {
      executive_summary: "Error crítico en el proceso de revisión.",
    };
  }
}
