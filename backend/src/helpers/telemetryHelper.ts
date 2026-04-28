import { SpanStatusCode } from "@opentelemetry/api";
import { TelemetryService } from "../services/telemetryService.js";
import { AgentStateType } from "@startup/shared";

/**
 * TelemetryHelper: Utilidades para instrumentación manual.
 */
export class TelemetryHelper {
  /**
   * Envuelve un nodo de LangGraph en un span de OpenTelemetry.
   * @param nodeName Nombre del nodo.
   * @param nodeFn Función original del nodo.
   */
  static wrapNode(nodeName: string, nodeFn: (state: AgentStateType, config?: unknown) => Promise<Partial<AgentStateType>> | Partial<AgentStateType>) {
    return async (state: AgentStateType, config?: unknown) => {
      const tracer = TelemetryService.getTracer();
      return tracer.startActiveSpan(`NODE:${nodeName}`, async (span) => {
        span.setAttributes({
          "node.name": nodeName,
          "project.id": state.project_context?.projectId || "unknown"
        });

        try {
          const result = await nodeFn(state, config);
          return result;
        } catch (error) {
          span.recordException(error as Error);
          span.setStatus({ code: SpanStatusCode.ERROR });
          throw error;
        } finally {
          span.end();
        }
      });
    };
  }
}
