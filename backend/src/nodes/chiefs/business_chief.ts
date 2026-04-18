import { AgentStateType } from "@/types/state.types.js";
import { LLMService } from "@/services/llmService.js";
import { SystemMessage, AIMessage } from "@langchain/core/messages";
import { TelemetryService } from "@/services/telemetryService.js";
import { AuditService } from "@/services/auditService.js";
import { z } from "zod";

/**
 * Esquema de decisión interna del Business Chief.
 */
const BusinessChiefDecisionSchema = z.object({
  reasoning: z.string().describe("Explicación del razonamiento de negocio detrás de la decisión."),
  decision: z.enum([
    "delegate_to_researcher",
    "delegate_to_lead_gen",
    "persist_results_to_engram",
    "complete",
    "need_strategic_clarification"
  ]),
  worker_instruction: z.string().nullable().optional().describe("Instrucción detallada para el worker o el AI Engine."),
  lead_gen_payload: z.object({
    niche: z.string().describe("Nicho de mercado para buscar leads."),
    location: z.string().optional().describe("Ubicación geográfica (si aplica)."),
    limit: z.number().default(10).describe("Cantidad de leads a buscar.")
  }).nullable().optional().describe("Configuración específica para el worker de Lead Generation.")
});

/**
 * Nodo BusinessChief: Responsable de la estrategia comercial y adquisición.
 * Coordina tareas de investigación de mercado y generación de leads.
 */
export async function business_chief_node(state: AgentStateType) {
  console.log("--- EJECUTANDO NODO BUSINESS CHIEF ---");

  // Verificamos si acabamos de recibir resultados de un worker (Ley de Robustez)
  const lastMessage = state.messages.length > 0 ? state.messages[state.messages.length - 1] : null;
  
  let hasWorkerResult = false;
  let aiEngineResult = null;

  if (lastMessage) {
    const content = typeof lastMessage.content === 'string' 
      ? lastMessage.content 
      : JSON.stringify(lastMessage.content);
      
    hasWorkerResult = content.includes("[WORKER_RESULT]");
    aiEngineResult = lastMessage.additional_kwargs?.ai_engine_result;
  }

  const system_prompt = new SystemMessage(`
    Eres el BusinessChief de una Startup Autónoma.
    Tu misión es ejecutar la visión estratégica del CEO en términos de mercado, clientes y crecimiento.

    TUS RECURSOS:
    1. Researcher: Worker para investigar competidores y mercado.
    2. LeadGen (AI Engine): Worker en Python para extraer leads reales.
    3. Tool: save_to_engram: Para persistir prospectos y hallazgos clave.
    
    ESTADO ACTUAL:
    ${hasWorkerResult ? "Acabas de recibir resultados de un worker. Evalúa si deben ser persistidos en Engram antes de terminar." : "Esperando nueva misión o procesando delegación."}
    ${aiEngineResult ? `RESULTADOS RECIBIDOS: ${JSON.stringify(aiEngineResult)}` : ""}

    ESTRATEGIA:
    - Si recibes leads del AI Engine, tu prioridad es PERSISTIRLOS en Engram usando 'persist_results_to_engram'.
    - Si el CEO pide conocer el mercado, delega al Researcher.
    - Si el objetivo es conseguir clientes, delega al LeadGen.
    
    REGLA DE ORO: No des por terminada una misión de Lead Gen hasta que los prospectos estén seguros en Engram.

    NOTAS SOBRE COORDINACIÓN:
    - Tú solo eres responsable de la parte COMERCIAL (investigación, leads, estrategia).
    - Si ya terminaste tu parte pero el pedido original incluía tareas técnicas (como crear una rama, escribir código, etc.), responde con 'complete' y aclara en tu razonamiento que la parte de negocio está lista pero la parte técnica sigue pendiente.
  `);

  try {
    const { data: response, usage, cost, latency } = await LLMService.getStructuredData(
      { type: "smart", temperature: 0 },
      [system_prompt, ...state.messages],
      BusinessChiefDecisionSchema
    );

    const projectId = state.project_context?.projectId || "unknown";

    // 1. Telemetría
    await TelemetryService.recordMetric(projectId, {
      node: "Business Chief",
      model: "gpt-4o",
      latency,
      usage
    });

    // 2. Auditoría
    await AuditService.logDecision(projectId, {
      agent: "Business Chief",
      decision: response.decision,
      reasoning: response.reasoning
    });

    console.log(`🧠 Business Chief Reasoning: ${response.reasoning}`);
    console.log(`📊 Costo: $${cost.toFixed(6)}`);

    const updates: Partial<AgentStateType> = {
      executive_summary: response.reasoning,
      active_chief: "business_chief",
      iteration_count: 1,
      token_usage: usage,
      total_cost_usd: cost,
      messages: state.messages.concat([new AIMessage({
        content: `[BUSINESS_CHIEF_THOUGHT] ${response.reasoning}
[DECISION] ${response.decision}`,
      })])
    };

    if (response.decision === "delegate_to_researcher") {
      updates.plan = ["research"];
      updates.next_node = "researcher";
    }
    else if (response.decision === "delegate_to_lead_gen") {
      updates.plan = ["ai_engine_task"];
      updates.next_node = "ai_engine_worker";
      updates.messages?.push(new AIMessage({
        content: `[BUSINESS_DELEGATION] Iniciando Lead Generation: ${response.reasoning}`,
        additional_kwargs: {
          ai_engine_task: {
            worker_name: "lead_gen",
            task_description: response.worker_instruction || `Prospección para: ${response.lead_gen_payload?.niche}`,
            trace_id: String(state.trace_id || Date.now()),
            payload: response.lead_gen_payload || {},
          }
        }
      }));
    }
    else if (response.decision === "persist_results_to_engram") {
      // Inyectamos la acción de llamar a la tool en el plan
      updates.plan = ["persist_memory"]; 
      updates.next_node = "persistence_worker";
      updates.messages?.push(new AIMessage({
        content: `[BUSINESS_PERSISTENCE] Guardando hallazgos en Engram: ${response.reasoning}`,
        additional_kwargs: {
          engram_data: {
            title: `Leads generados para ${response.lead_gen_payload?.niche || 'nicho desconocido'}`,
            type: "lead",
            topic_key: `leads/${response.lead_gen_payload?.niche || 'general'}`,
            content: {
              What: "Generación de leads estructurados desde AI Engine.",
              Why: "Persistencia para futuras campañas de marketing.",
              Data: aiEngineResult
            }
          }
        }
      }));
    }
    else if (response.decision === "complete") {
      updates.plan = [];
      updates.next_node = "ceo";
      updates.completed_steps = ["business_chief"];
      updates.executive_summary = response.reasoning;
    }
    else if (response.decision === "need_strategic_clarification") {
      updates.plan = [];
      updates.next_node = "ceo";
      updates.executive_summary = `Business Chief requiere aclaración estratégica: ${response.reasoning}`;
    }

    return updates;
  } catch (error) {
    console.error("❌ Error en el Business Chief:", error);
    return {
      plan: [],
      executive_summary: "Error crítico en Business Chief."
    };
  }
}
