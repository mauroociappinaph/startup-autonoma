import { getRedisConnection } from "../db/redis.js";
import { ProjectContext } from "@startup/shared";
import { EventBus } from "./eventBus.js";
import { TelemetryService } from "./telemetryService.js";

/**
 * BudgetService: Manages token and USD budget limits per project.
 * Persists accumulated usage in Redis for multi-tenant isolation.
 */
export class BudgetService {
  private static readonly KEY_PREFIX = "project:budget:usage:";
  private telemetryService: TelemetryService;

  constructor(telemetryService = new TelemetryService()) {
    this.telemetryService = telemetryService;
  }

  /**
   * Retrieves the accumulated token usage for a project.
   */
  async getProjectUsage(projectId: string): Promise<number> {
    const redis = getRedisConnection();
    const key = `${BudgetService.KEY_PREFIX}${projectId}`;
    const usage = await redis.get(key);
    return usage ? parseFloat(usage) : 0;
  }

  /**
   * Records new token usage.
   */
  async recordUsage(projectId: string, amount: number): Promise<number> {
    if (amount <= 0) return await this.getProjectUsage(projectId);

    const redis = getRedisConnection();
    const key = `${BudgetService.KEY_PREFIX}${projectId}`;
    const newTotal = await redis.incrbyfloat(key, amount);

    return parseFloat(newTotal);
  }

  /**
   * Evaluates token and USD limits, triggering alerts if necessary.
   */
  async checkSecurityStatus(context: ProjectContext) {
    const totalUsage = await this.getProjectUsage(context.projectId);
    const tokenLimit = context.maxTokenBudget;

    // Get financial stats from TelemetryService
    const stats = await this.telemetryService.getProjectStats(context.projectId);
    const totalCostUsd = stats.total_cost_usd || 0;
    const usdLimit = context.maxUsdBudget || 10.0;

    const tokenPercentage = (totalUsage / tokenLimit) * 100;
    const usdPercentage = (totalCostUsd / usdLimit) * 100;

    // USD Alert Logic (90%)
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
