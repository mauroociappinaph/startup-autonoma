import { AgentStateType } from "@startup/shared";
import { AIMessage } from "@langchain/core/messages";

/**
 * Nodo SecurityBlocked: Punto final de seguridad.
 * Se ejecuta cuando AduanaSentinel detecta una amenaza crítica.
 */
export async function security_blocked_node(state: AgentStateType) {
  console.log("🛑 [SECURITY_BLOCKED] Deteniendo ejecución por amenaza detectada.");

  return {
    messages: [new AIMessage({
      content: `⚠️ ACCESO DENEGADO: El sistema ha bloqueado esta solicitud por motivos de seguridad. 
Reporte: ${state.security_report || "Intento de intrusión detectado."}`,
    })],
    executive_summary: "BLOQUEO DE SEGURIDAD: El flujo fue interrumpido permanentemente.",
    plan: [], // Limpiamos el plan para asegurar la detención
    next_node: "end" 
  };
}
