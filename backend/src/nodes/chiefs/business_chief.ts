import { AgentStateType } from "@/types/state.types.js";
import { LLMService } from "@/services/llmService.js";
import { SystemMessage, AIMessage } from "@langchain/core/messages";
import { z } from "zod";

/**
 * Esquema de decisión interna del Business Chief.
 */
const BusinessChiefDecisionSchema = z.object({
  decision: z.enum([
    "delegate_to_researcher",
    "delegate_to_lead_gen",
    "persist_results_to_engram",
    "complete",
    "need_strategic_clarification"
  ]),
  reasoning: z.string().describe("Explicación del razonamiento de negocio detrás de la decisión."),
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

  // Verificamos si acabamos de recibir resultados de un worker
  const lastMessage = state.messages[state.messages.length - 1];
  
  // Aseguramos que el contenido sea string para la búsqueda (Ley de Robustez)
  const content = typeof lastMessage.content === 'string' 
    ? lastMessage.content 
    : JSON.stringify(lastMessage.content);

  const hasWorkerResult = content.includes("[WORKER_RESULT]");
  const aiEngineResult = lastMessage.additional_kwargs?.ai_engine_result;

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
  `);

  try {
    const response = await LLMService.getStructuredData(
      { type: "smart", temperature: 0 },
      [system_prompt, ...state.messages],
      BusinessChiefDecisionSchema
    );

    console.log(`🧠 Business Chief Reasoning: ${response.reasoning}`);

    const updates: Partial<AgentStateType> = {
      active_chief: "business_chief",
      messages: state.messages.concat([new AIMessage({
        content: `[BUSINESS_CHIEF_THOUGHT] ${response.reasoning}
[BUSINESS_CHIEF_DECISION] ${response.decision}`,
      })])
    };

    if (response.decision === "delegate_to_researcher") {
      updates.plan = ["research"];
    }
    else if (response.decision === "delegate_to_lead_gen") {
      updates.plan = ["ai_engine_task"];
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
      updates.completed_steps = ["business_chief"];
      updates.executive_summary = response.reasoning;
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
