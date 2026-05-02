import { getRedisConnection } from "../db/redis.js";
import { MODEL_PRICING } from "../config/pricing.js";
import { EventBus } from "./eventBus.js";
import { SacredLogger } from "../helpers/logger.js";
import * as opentelemetry from "@opentelemetry/api";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { GrpcInstrumentation } from "@opentelemetry/instrumentation-grpc";
import { RedisInstrumentation } from "@opentelemetry/instrumentation-redis-4";
import { PrismaInstrumentation } from "@prisma/instrumentation";
import { registerInstrumentations } from "@opentelemetry/instrumentation";

/**
 * OpenTelemetry Configuration
 */
const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "startup-backend",
  }),
});

const exporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318/v1/traces",
});

provider.addSpanProcessor(new BatchSpanProcessor(exporter));
provider.register();

registerInstrumentations({
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new GrpcInstrumentation(),
    new RedisInstrumentation(),
    new PrismaInstrumentation(),
  ],
});

// Iniciamos el SDK de forma asíncrona pero sin bloquear el resto del sistema
if (process.env.OTEL_ENABLED === "true") {
  SacredLogger.info("🛡️ [OTEL] OpenTelemetry SDK Initialized and Exporting to Jaeger", "TELEMETRY_SDK");
}

/**
 * TelemetryService: Advanced observability engine.
 * Measures latency and reports metrics in real-time (Gap 6).
 */
export class TelemetryService {
  private static readonly KEY_PREFIX = "project:telemetry:stats:";

  static getTracer() {
    return opentelemetry.trace.getTracer("startup-backend");
  }



  /**
   * Registers and emits a complete telemetry event, persisting totals in Redis.
   */
  async recordMetric(projectId: string, data: {
    node: string;
    model: string;
    latency: number;
    usage: { total: number; prompt: number; completion: number };
    cost: number;
    trace_id?: string;
  }) {
    const cost = data.cost;
    const redis = getRedisConnection();
    const statsKey = `${TelemetryService.KEY_PREFIX}${projectId}`;
    
    // Update accumulated values in Redis atomically
    const pipeline = redis.pipeline();
    pipeline.hincrbyfloat(statsKey, "total_cost_usd", cost);
    pipeline.hincrby(statsKey, "total_tokens", data.usage.total);
    pipeline.hincrby(statsKey, "total_runs", 1);
    pipeline.hincrbyfloat(statsKey, "total_latency_ms", data.latency);
    await pipeline.exec();
    
    SacredLogger.info(`📊 [TELEMETRÍA] ${data.node} (${data.model}) -> Latencia: ${data.latency.toFixed(2)}ms | Costo: $${cost.toFixed(6)}`, "METRICS");

    // Publish to Dashboard via EventBus
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
   * Retrieves accumulated stats for a project.
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
