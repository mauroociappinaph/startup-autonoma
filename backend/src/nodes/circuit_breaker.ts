import { AgentStateType } from "@/types/state.types.js";
import { AIMessage } from "@langchain/core/messages";

/**
 * Límites de seguridad para la Startup Autónoma.
 * Estos valores actúan como el último recurso antes de un fallo catastrófico o gasto excesivo.
 */
const MAX_ITERATIONS = 20;
const MAX_TOKENS = 100000; // 100k tokens por sesión

/**
 * Nodo Circuit Breaker: El Guardián del Grafo.
 * Evalúa en cada paso si el sistema sigue dentro de los márgenes de seguridad.
 */
export async function circuit_breaker_node(state: AgentStateType) {
  console.log("--- EVALUANDO CIRCUIT BREAKER ---");
  console.log(`📊 Progreso: Paso ${state.iteration_count} | Tokens acumulados: ${state.token_usage.total}`);

  // 1. Verificación de Bucle Infinito (Iteraciones)
  if (state.iteration_count >= MAX_ITERATIONS) {
    console.error("🚨 [CIRCUIT BREAKER] Límite de iteraciones alcanzado.");
    return {
      max_budget_reached: true,
      executive_summary: "🚨 Emergercia: Límite de iteraciones alcanzado. Se sospecha de un bucle infinito entre agentes.",
      messages: [new AIMessage({
        content: `🚨 **CIRCUIT BREAKER ACTIVADO**\n\nEl sistema ha realizado ${state.iteration_count} iteraciones, lo cual supera el límite de seguridad de ${MAX_ITERATIONS}. He detenido todos los procesos para evitar un consumo indefinido de recursos.`,
      })],
      plan: [] // Limpiamos el plan para forzar el fin
    };
  }

  // 2. Verificación de Presupuesto (Tokens)
  if (state.token_usage.total >= MAX_TOKENS) {
    console.error("🚨 [CIRCUIT BREAKER] Presupuesto de tokens excedido.");
    return {
      max_budget_reached: true,
      executive_summary: "🚨 Emergencia: Presupuesto de tokens agotado.",
      messages: [new AIMessage({
        content: `🚨 **CIRCUIT BREAKER ACTIVADO**\n\nEl consumo total de tokens (${state.token_usage.total}) ha superado el límite establecido de ${MAX_TOKENS}. Por favor, revisa el plan y la complejidad de la tarea.`,
      })],
      plan: []
    };
  }

  // Si todo está bien, permitimos que el grafo continúe hacia el next_node
  return {
    max_budget_reached: false,
    // Limpiamos el next_node tras cruzar la frontera de seguridad para evitar loops accidentales
    // El ruteo condicional en el grafo usará el valor de next_node ANTES de limpiarlo
  };
}
