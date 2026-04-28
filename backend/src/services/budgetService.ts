import { getRedisConnection } from "../db/redis.js";
import { ProjectContext } from "@startup/shared";
import { EventBus } from "./eventBus.js";
import { TelemetryService } from "./telemetryService.js";

/**
 * BudgetService: Gestiona el control de gastos y límites de tokens/USD por proyecto.
 * Persiste el consumo acumulado en Redis para aislamiento multi-tenant.
 */
export class BudgetService {
  private static readonly KEY_PREFIX = "project:budget:usage:";
  private telemetryService: TelemetryService;

  constructor(telemetryService = new TelemetryService()) {
    this.telemetryService = telemetryService;
  }

  /**
   * Obtiene el consumo acumulado de tokens para un proyecto.
   */
  async getProjectUsage(projectId: string): Promise<number> {
    const redis = getRedisConnection();
    const key = `${BudgetService.KEY_PREFIX}${projectId}`;
    const usage = await redis.get(key);
    return usage ? parseInt(usage, 10) : 0;
  }

  /**
   * Registra un nuevo consumo de tokens.
   */
  async recordUsage(projectId: string, amount: number): Promise<number> {
    if (amount <= 0) return await this.getProjectUsage(projectId);

    const redis = getRedisConnection();
    const key = `${BudgetService.KEY_PREFIX}${projectId}`;
    const newTotal = await redis.incrby(key, Math.round(amount));

    return newTotal;
  }

  /**
   * Evalúa los límites de tokens y USD y dispara alertas si es necesario.
   */
  async checkSecurityStatus(context: ProjectContext) {
    const totalUsage = await this.getProjectUsage(context.projectId);
    const tokenLimit = context.maxTokenBudget;

    // Obtener stats financieros de TelemetryService
    const stats = await this.telemetryService.getProjectStats(context.projectId);
    const totalCostUsd = stats.total_cost_usd || 0;
    const usdLimit = context.maxUsdBudget || 10.0;

    const tokenPercentage = (totalUsage / tokenLimit) * 100;
    const usdPercentage = (totalCostUsd / usdLimit) * 100;

    // Lógica de Alerta de USD (90%)
    if (usdPercentage >= 90 && usdPercentage < 100) {
      await EventBus.publish(context.projectId, {
        agent: "SYSTEM",
        text: `🚨 CRÍTICO (USD): Se ha alcanzado el 90% del presupuesto USD ($${totalCostUsd.toFixed(4)}/$${usdLimit.toFixed(2)}).`,
        type: "CRITICAL",
        level: 90
      });
    }

    const isLimitReached = totalUsage >= tokenLimit || totalCostUsd >= usdLimit;

    let message = "";
    if (totalUsage >= tokenLimit) message = "Límite de tokens alcanzado.";
    if (totalCostUsd >= usdLimit) message = "Presupuesto USD excedido.";

    return {
      status: isLimitReached ? "FAIL" : "PASS",
      max_budget_reached: isLimitReached,
      tokenUsage: totalUsage,
      tokenLimit,
      totalUsdUsage: totalCostUsd,
      usdLimit,
      message
    };
  }
}
