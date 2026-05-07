import { type AgentThought, type AgentActions } from "@/types/index";
import { parseAgentThought } from "@/helpers";

/**
 * Servicio de dominio para procesar la lógica de los pensamientos de los agentes
 * y orquestar las actualizaciones del store.
 * Ahora desacoplado de la implementación del store mediante la interfaz AgentActions.
 */
export const agentProcessor = {
  /**
   * Procesa un evento individual del stream y actualiza el store.
   */
  process(data: AgentThought, store: AgentActions): boolean {
    if (data.error) {
      this.handleError(data.error as string, store);
      return false;
    }

    // 1. Telemetría y Metadatos (Sin chat)
    if (data.type === "METRIC_PARTIAL" && data.metadata) {
      store.updateTelemetry({
        tokens: data.metadata.estimated_tokens,
        cost: data.metadata.estimated_cost,
      });
      return true;
    }

    // 2. Orquestación de Estado Global
    if (data.activeNode) store.setActiveNode(data.activeNode);
    if (data.plan && data.plan.length > 0) store.setCurrentPlan(data.plan);
    if (data.completedSteps && data.completedSteps.length > 0) {
      store.setCompletedSteps((prev: string[]) => Array.from(new Set([...prev, ...data.completedSteps!])));
    }
    if (data.executiveSummary) store.setExecutiveSummary(data.executiveSummary);
    if (data.isWaiting) store.setIsWaiting(true);
    if (data.threadId) store.setThreadId(data.threadId);

    // 3. Telemetría Final
    if (data.token_usage || data.total_cost_usd) {
      store.updateTelemetry({
        tokens: data.token_usage?.total,
        iterations: data.iteration_count,
        cost: data.total_cost_usd
      });
    }

    // 4. Gestión de Pensamientos (Solo si hay contenido real)
    if (data.type === "SECURITY_ANALYSIS" && data.security_audit) {
      data.text = data.text || `🛡️ Seguridad: ${data.security_audit.verdict === 'safe' ? 'PERMITIDO' : 'BLOQUEADO'}`;
      this.updateThoughts(data, store);
      return true;
    }

    if (data.text || data.thought) {
      // Parsing XML CoT si es necesario
      if (data.text && !data.thought) {
        const parsed = parseAgentThought(data.text);
        data.thought = parsed.thought;
        data.plan_steps = parsed.plan;
        data.verification = parsed.verification;
      }
      
      console.log(`[AgentProcessor] Agregando pensamiento de ${data.agent}:`, data.text?.slice(0, 30));
      this.updateThoughts(data, store);
      return true;
    }

    return true;
  },

  handleError(error: string, store: AgentActions) {
    store.setThoughts((prev: AgentThought[]) => [
      ...prev, 
      { id: crypto.randomUUID(), agent: "ERROR", text: error, time: new Date().toLocaleTimeString() }
    ]);
    store.setIsStreaming(false);
    store.setIsWaiting(false);
    store.setActiveNode(null);
  },

  updateThoughts(data: AgentThought, store: AgentActions) {
    store.setThoughts((prev: AgentThought[]) => {
      let next: AgentThought[];

      if (data.isPartial) {
        const last = prev[prev.length - 1];
        if (last && last.isPartial && last.agent === data.agent) {
          const updated = { ...last, text: last.text + data.text };
          next = [...prev.slice(0, -1), updated];
        } else {
          next = [...prev, { ...data, id: crypto.randomUUID(), time: new Date().toLocaleTimeString() }];
        }
      } else {
        const last = prev[prev.length - 1];
        if (last && last.isPartial && last.agent === data.agent) {
          next = [...prev.slice(0, -1), { ...data, id: last.id, time: last.time || new Date().toLocaleTimeString() }];
        } else {
          next = [...prev, { ...data, id: crypto.randomUUID(), time: data.time || new Date().toLocaleTimeString() }];
        }
      }

      const limit = 100;
      return next.length > limit ? next.slice(-limit) : next;
    });
  }
};
