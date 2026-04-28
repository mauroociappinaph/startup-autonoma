import { getRedisConnection } from "../db/redis.js";
import { MODEL_PRICING } from "../config/pricing.js";
import { EventBus } from "./eventBus.js";
import { SacredLogger } from "../helpers/logger.js";
import * as opentelemetry from "@opentelemetry/api";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

/**
 * OpenTelemetry Configuration
 */
const otelSdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "startup-backend",
  }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318/v1/traces",
  }),
});

// Iniciamos el SDK de forma asíncrona pero sin bloquear el resto del sistema
if (process.env.OTEL_ENABLED === "true") {
  otelSdk.start();
  SacredLogger.info("🛡️ [OTEL] OpenTelemetry SDK Initialized and Exporting to Jaeger", "TELEMETRY_SDK");
}

/**
 * TelemetryService: Motor de observabilidad avanzada.
 * Calcula costos, mide latencia y reporta métricas en tiempo real (Gap 6).
 */
export class TelemetryService {
  private static readonly KEY_PREFIX = "project:telemetry:stats:";

  /**
   * Obtiene el tracer global de la aplicación.
   */
  static getTracer() {
    return opentelemetry.trace.getTracer("startup-backend");
  }

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
   * Registra y emite un evento de telemetría completo, persistiendo los totales en Redis.
   */
  async recordMetric(projectId: string, data: {
    node: string;
    model: string;
    latency: number;
    usage: { total: number; prompt: number; completion: number };
    trace_id?: string;
  }) {
    const cost = (this.constructor as typeof TelemetryService).calculateCost(data.usage, data.model);
    const redis = getRedisConnection();
    const statsKey = `${TelemetryService.KEY_PREFIX}${projectId}`;
    
    // Actualizamos acumulados en Redis de forma atómica
    const pipeline = redis.pipeline();
    pipeline.hincrbyfloat(statsKey, "total_cost_usd", cost);
    pipeline.hincrby(statsKey, "total_tokens", data.usage.total);
    pipeline.hincrby(statsKey, "total_runs", 1);
    pipeline.hincrbyfloat(statsKey, "total_latency_ms", data.latency);
    await pipeline.exec();
    
    SacredLogger.info(`📊 [TELEMETRÍA] ${data.node} (${data.model}) -> Latencia: ${data.latency.toFixed(2)}ms | Costo: $${cost.toFixed(6)}`, "METRICS");

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
        trace_id: data.trace_id,
        timestamp: Date.now()
      }
    });

    return cost;
  }

  /**
   * Recupera las estadísticas acumuladas de un proyecto.
   */
  async getProjectStats(projectId: string) {
    const redis = getRedisConnection();
    const statsKey = `${TelemetryService.KEY_PREFIX}${projectId}`;
    const stats = await redis.hgetall(statsKey);
    
    return {
      total_cost_usd: parseFloat(stats.total_cost_usd || "0"),
      total_tokens: parseInt(stats.total_tokens || "0"),
      total_runs: parseInt(stats.total_runs || "0"),
      avg_latency_ms: stats.total_runs ? parseFloat(stats.total_latency_ms || "0") / parseInt(stats.total_runs) : 0
    };
  }
}

export const telemetryService = new TelemetryService();
