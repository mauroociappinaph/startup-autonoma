import { LLMService } from "../services/llmService.js";
import { CEOResponseSchema } from "../contracts/ceo.js";
import { AgentStateType } from "@/types/state.types.js";
import { SystemMessage, AIMessage } from "@langchain/core/messages";

/**
 * Nodo CEO: Orquestador Principal del Grafo.
 * Su misión es analizar, planificar y delegar a los Chiefs correspondientes.
 */
export async function ceo_node(state: AgentStateType) {
  console.log("--- EJECUTANDO NODO CEO ---");

  const system_prompt = new SystemMessage(`
    Actúa como el CEO de una Startup Autónoma de IA. 
    Tu objetivo es coordinar a un equipo de agentes para cumplir con el pedido del usuario.
    
    ESTRUCTURA DE TU EQUIPO:
    1. Software Chief: Para todo lo relacionado con código, arquitectura, tests y despliegue técnico.
    2. Business Chief: Para investigación de mercado, competidores, lead generation y estrategia comercial.
    
    ESTRATEGIA:
    1. Analiza el historial de mensajes.
    2. Decide si el pedido requiere un enfoque técnico (Software) o comercial (Business).
    3. Delega la misión al Chief correspondiente usando 'delegated_to'.
    4. Si la misión de un Chief terminó, evalúa si falta algo más o si el objetivo global se cumplió.
    
    REGLA DE ORO: DELEGA. No intentes resolver detalles técnicos o de mercado tú mismo.
    
    CRITERIO DE FINALIZACIÓN:
    - Solo puedes responder con 'finish' si TODAS las intenciones y objetivos refinados por el Mirror Node han sido completados.
    - Si el Business Chief terminó una investigación pero todavía falta crear una rama de Git (Software), NO termines; delega al Software Chief.
    - Si el Software Chief terminó el código pero falta investigar el mercado, NO termines; delega al Business Chief.
    - Sé obsesivo con el cumplimiento del plan total.
  `);

  try {
    const response = await LLMService.getStructuredData(
      { type: "smart", temperature: 0 },
      [system_prompt, ...state.messages],
      CEOResponseSchema
    );

    console.log(`✅ CEO Decision: ${response.next_step} -> ${response.reasoning}`);
    console.log(`🎯 Delegado: ${response.delegated_to || "Ninguno"}`);

    const updates: Partial<AgentStateType> = {
      executive_summary: response.analysis,
      active_chief: (response.delegated_to as "software_chief" | "business_chief" | undefined),
      messages: state.messages.concat([new AIMessage({
        content: `[CEO_THOUGHT] ${response.reasoning}
[CEO_DECISION] ${response.next_step} ${response.delegated_to ? `a ${response.delegated_to}` : ""}`,
      })])
    };

    // Si el CEO delega, el plan indica a qué jefe ir.
    // Usamos el campo 'active_chief' como señal para las aristas condicionales del grafo.
    if (response.next_step === "delegate" && response.delegated_to) {
      updates.plan = [response.delegated_to];
    } else {
      updates.plan = [];
    }

    return updates;
  } catch (error) {
    console.error("❌ Fallo en el Nodo CEO:", error);
    return {
      messages: state.messages.concat([new AIMessage({
        content: `[CEO_ERROR] Fallo crítico en la orquestación: ${error instanceof Error ? error.message : String(error)}`
      })]),
      plan: [],
      executive_summary: "Error interno en el CEO."
    };
  }
}
