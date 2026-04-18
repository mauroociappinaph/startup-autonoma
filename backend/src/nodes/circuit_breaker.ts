import { AgentStateType } from "@/types/state.types.js";
import { AIMessage } from "@langchain/core/messages";
import { BudgetService } from "@/services/budgetService.js";

/**
 * Límites de seguridad por defecto (Fallbacks si no hay contexto).
 */
const FALLBACK_MAX_ITERATIONS = 20;

/**
 * Nodo Circuit Breaker: El Guardián del Grafo.
 * Evalúa en cada paso si el sistema sigue dentro de los márgenes de seguridad dinámicos (Gap 5).
 */
export async function circuit_breaker_node(state: AgentStateType) {
  console.log("--- EVALUANDO CIRCUIT BREAKER (SEGURIDAD DINÁMICA) ---");
  
  const project = state.project_context;
  const currentSessionTokens = state.token_usage.total;
  const currentIterations = state.iteration_count;
  const lastRecorded = state.last_recorded_tokens || 0;

  // Sincronizar gasto con Redis si hubo consumo nuevo (Gap 5)
  if (project && currentSessionTokens > lastRecorded) {
    const diff = currentSessionTokens - lastRecorded;
    console.log(`🤑 Sincronizando consumo nuevo: ${diff} tokens...`);
    await BudgetService.recordUsage(project.projectId, diff);
  }

  // 1. Verificación de Bucle Infinito (Iteraciones)
  const maxIterations = FALLBACK_MAX_ITERATIONS;
  if (currentIterations >= maxIterations) {
    console.error(`🚨 [CIRCUIT BREAKER] Límite de iteraciones alcanzado (${currentIterations}).`);
    return {
      max_budget_reached: true,
      last_recorded_tokens: currentSessionTokens, // Aseguramos registro final
      executive_summary: "🚨 Emergencia: Límite de iteraciones alcanzado. Se ha detenido el proceso para evitar bucles.",
      messages: state.messages.concat([new AIMessage({
        content: `🚨 **CIRCUIT BREAKER**\nSe alcanzó el límite de ${maxIterations} iteraciones. Operación abortada por seguridad.`,
      })]),
      plan: []
    };
  }

  // 2. Verificación de Presupuesto Dinámico (Tokens)
  if (project) {
    // checkSecurityStatus ya contempla el acumulado total en Redis
    const status = await BudgetService.checkSecurityStatus(project, 0); 
    
    console.log(`📊 Presupuesto del Proyecto: ${status.totalUsage} / ${status.limit} tokens (${status.percentage.toFixed(2)}%)`);

    if (status.isLimitReached) {
      console.error("🚨 [CIRCUIT BREAKER] Presupuesto TOTAL del proyecto excedido.");
      return {
        max_budget_reached: true,
        last_recorded_tokens: currentSessionTokens,
        executive_summary: "🚨 Emergencia: Presupuesto total de la startup agotado.",
        messages: state.messages.concat([new AIMessage({
          content: `🚨 **LÍMITE DE PROYECTO ALCANZADO**\n\nTu startup ha consumido ${status.totalUsage} tokens de un límite de ${status.limit}. No es posible continuar sin ampliar el presupuesto.`,
        })]),
        plan: []
      };
    }
  }

  return {
    max_budget_reached: false,
    last_recorded_tokens: currentSessionTokens,
  };
}
