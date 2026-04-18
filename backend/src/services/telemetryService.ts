import { MODEL_PRICING } from "../config/pricing.js";
import { EventBus } from "./eventBus.js";

/**
 * TelemetryService: Motor de observabilidad avanzada.
 * Calcula costos, mide latencia y reporta métricas en tiempo real (Gap 6).
 */
export class TelemetryService {
  /**
   * Calcula el costo en USD basado en el uso y el modelo.
   */
  static calculateCost(usage: { prompt: number; completion: number }, model: string): number {
    const pricing = MODEL_PRICING[model] || MODEL_PRICING["default"];
    
    const inputCost = (usage.prompt / 1_000_000) * pricing.input;
    const outputCost = (usage.completion / 1_000_000) * pricing.output;
    
    return inputCost + outputCost;
  }

  /**
   * Registra y emite un evento de telemetría completo.
   */
  static async recordMetric(projectId: string, data: {
    node: string;
    model: string;
    latency: number;
    usage: { total: number; prompt: number; completion: number };
  }) {
    const cost = this.calculateCost(data.usage, data.model);
    
    console.log(`📊 [TELEMETRÍA] ${data.node} (${data.model}) -> Latencia: ${data.latency.toFixed(2)}ms | Costo: $${cost.toFixed(6)}`);

    // Publicamos al Dashboard vía EventBus
    await EventBus.publish(projectId, {
      agent: "SYSTEM",
      type: "METRIC_UPDATE",
      text: `Métrica del nodo ${data.node}`,
      metadata: {
        node: data.node,
        model: data.model,
        latency: data.latency,
        usage: data.usage,
        cost: cost,
        timestamp: Date.now()
      }
    });

    return cost;
  }
}
