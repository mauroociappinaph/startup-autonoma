import { AsyncLocalStorage } from "node:async_hooks";
import { TraceStore } from "../types/telemetry.js";
import { v4 as uuidv4 } from "uuid";
import * as opentelemetry from "@opentelemetry/api";

/**
 * TraceContext: Gestión de almacenamiento asíncrono para observabilidad distribuida.
 * Permite propagar el trace_id a través de promesas y hilos de ejecución sin prop-drilling.
 */
export class TraceContext {
  private static storage = new AsyncLocalStorage<TraceStore>();

  /**
   * Ejecuta una función dentro de un contexto de traza específico.
   * @param traceId ID de la traza (generado si es undefined).
   * @param fn Función a ejecutar.
   */
  static run<T>(traceId: string | undefined, fn: () => T): T {
    const store: TraceStore = {
      traceId: traceId || uuidv4(),
      startTime: Date.now()
    };
    return this.storage.run(store, fn);
  }

  /**
   * Recupera el traceId del contexto actual.
   * Prioriza el traceId de OpenTelemetry si hay un span activo.
   * @returns traceId o undefined si no hay contexto activo.
   */
  static getTraceId(): string | undefined {
    // 1. Intentamos obtenerlo de OpenTelemetry
    const activeSpan = opentelemetry.trace.getActiveSpan();
    if (activeSpan) {
      return activeSpan.spanContext().traceId;
    }

    // 2. Fallback al almacenamiento asíncrono manual
    return this.storage.getStore()?.traceId;
  }

  /**
   * Recupera el tiempo de inicio del contexto actual.
   * @returns timestamp o undefined.
   */
  static getStartTime(): number | undefined {
    return this.storage.getStore()?.startTime;
  }
}
