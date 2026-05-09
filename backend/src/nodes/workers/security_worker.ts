import { AgentStateType } from "@startup/shared";
import { services } from "@/services/index.js";
import { SystemMessage, AIMessage } from "@langchain/core/messages";
import { SecurityWorkerSchema } from "@startup/shared";
import { prepareNodeUpdate } from "@/helpers/index.js";

/**
 * SecurityWorker: El Guardián de la Ciberseguridad.
 * Analiza el código propuesto en busca de vulnerabilidades y riesgos.
 */
export async function security_worker_node(state: AgentStateType): Promise<Partial<AgentStateType>> {
  console.log("\n--- EJECUTANDO NODO SECURITY WORKER ---");

  const system_prompt = new SystemMessage(`
    Eres un experto en Ciberseguridad y Hacker Ético.
    Tu misión es auditar el código generado por otros agentes para prevenir brechas de seguridad.
    
    ESTRUCTURA DE RAZONAMIENTO:
    1. <thought>: Analiza las vulnerabilidades potenciales.
    2. <plan>: Pasos para el escaneo de seguridad.
    3. <verification>: Confirmación de parches o riesgos mitigados.

    REGLA DE BLOQUEO:
    Si encuentras una vulnerabilidad de severidad 'high' o 'critical', SIEMPRE pon 'should_block: true'.
  `);

  try {
    const { data: response, usage, cost, latency, model } = await services.llm.getStructuredData(
      { type: "reasoning", temperature: 0 },
      [system_prompt, ...state.messages],
      SecurityWorkerSchema
    );

    console.log(`🛡️ Security Audit: ${response.status} -> ${response.reasoning}`);

    const metricsUpdate = await prepareNodeUpdate(state, {
      nodeName: "Security Worker",
      model: model || "unknown",
      usage,
      latency,
      cost,
      decision: response.status,
      reasoning: response.reasoning
    });

    const updates: Partial<AgentStateType> = {
      ...metricsUpdate,
      executive_summary: response.reasoning,
      messages: state.messages.concat([new AIMessage({
        content: `[SECURITY_WORKER_RESULT] Status: ${response.status}
Reasoning: ${response.reasoning}
Block Flow: ${response.should_block ? "YES" : "NO"}
Vulnerabilities Found: ${response.vulnerabilities.length}`,
      })])
    };

    return updates;
  } catch (error) {
    console.error("❌ Error en el Nodo Security Worker:", error);
    return {
      executive_summary: "Error crítico en el proceso de auditoría de seguridad.",
    };
  }
}
