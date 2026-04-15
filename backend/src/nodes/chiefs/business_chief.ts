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

  const system_prompt = new SystemMessage(`
    Eres el BusinessChief de una Startup Autónoma.
    Tu misión es ejecutar la visión estratégica del CEO en términos de mercado, clientes y crecimiento.

    TUS RECURSOS:
    1. Researcher: Worker para investigar competidores, tendencias de mercado y perfiles de clientes.
    2. LeadGen (AI Engine): Worker especializado en Python para extraer y calificar leads reales.
    
    ESTRATEGIA:
    - Si el CEO pide conocer el mercado o la competencia, delega al Researcher.
    - Si el objetivo es conseguir clientes, prospectos o emails, delega al LeadGen en el AI Engine.
    - Mantén siempre el foco en el Retorno de Inversión (ROI) y la viabilidad del modelo de negocio.
    
    Solo marca como "complete" cuando los resultados (investigación o leads) sean accionables para la Startup.
  `);

  try {
    const response = await LLMService.getStructuredResponse(
      { type: "smart", temperature: 0 },
      [system_prompt, ...state.messages],
      BusinessChiefDecisionSchema
    );

    console.log(`🧠 Business Chief Reasoning: ${response.reasoning}`);
    console.log(`🎯 Decision: ${response.decision}`);

    const updates: Partial<AgentStateType> = {
      active_chief: "business_chief",
      messages: state.messages.concat([new AIMessage({
        content: `[BUSINESS_CHIEF_THOUGHT] ${response.reasoning}
[BUSINESS_CHIEF_DECISION] ${response.decision}`,
      })])
    };

    if (response.decision === "delegate_to_researcher") {
      updates.plan = ["research"];
      updates.messages?.push(new AIMessage({
        content: `[BUSINESS_DELEGATION] Delegando investigación de mercado: ${response.worker_instruction || 'Análisis de mercado requerido.'}`,
      }));
    }
    else if (response.decision === "delegate_to_lead_gen") {
      updates.plan = ["ai_engine_task"];
      updates.messages?.push(new AIMessage({
        content: `[BUSINESS_DELEGATION] Iniciando proceso de Lead Generation: ${response.reasoning}`,
        additional_kwargs: {
          ai_engine_task: {
            worker_name: "lead_gen",
            task_description: response.worker_instruction || `Buscar leads para el nicho: ${response.lead_gen_payload?.niche}`,
            trace_id: state.trace_id || "biz-trace",
            payload: response.lead_gen_payload || {},
          }
        }
      }));
    }
    else if (response.decision === "need_strategic_clarification") {
      updates.plan = [];
      updates.executive_summary = `El Business Chief requiere definiciones del CEO: ${response.reasoning}`;
      updates.messages?.push(new AIMessage({
        content: `[BUSINESS_CLARIFICATION] ${response.reasoning}`,
      }));
    }
    else if (response.decision === "complete") {
      updates.plan = [];
      updates.executive_summary = response.reasoning;
    }

    return updates;
  } catch (error) {
    console.error("❌ Error en el Business Chief:", error);
    return {
      messages: state.messages.concat([new AIMessage({
        content: `[BUSINESS_CHIEF_ERROR] Falla en el procesamiento estratégico: ${error instanceof Error ? error.message : String(error)}`
      })]),
      plan: [],
      executive_summary: `Error crítico en Business Chief: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
