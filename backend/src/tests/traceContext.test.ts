import { TraceContext } from "../services/traceContext.js";
import * as opentelemetry from "@opentelemetry/api";
import { AsyncHooksContextManager } from "@opentelemetry/context-async-hooks";

// Registrar el context manager para que OTel pueda propagar el contexto en los tests
const contextManager = new AsyncHooksContextManager();
contextManager.enable();
opentelemetry.context.setGlobalContextManager(contextManager);

describe("TraceContext & Observability Propagation", () => {
  it("debe propagar el traceId a través de llamadas asíncronas", async () => {
    const testTraceId = "test-123-abc";
    
    await TraceContext.run(testTraceId, async () => {
      expect(TraceContext.getTraceId()).toBe(testTraceId);
      
      // Simular delay asíncrono
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(TraceContext.getTraceId()).toBe(testTraceId);
    });
  });

  it("debe generar un UUID si no se provee uno", () => {
    TraceContext.run(undefined, () => {
      const tid = TraceContext.getTraceId();
      expect(tid).toBeDefined();
      expect(tid?.length).toBeGreaterThan(20);
    });
  });

  it("no debe haber interferencia entre contextos paralelos", async () => {
    const p1 = TraceContext.run("trace-1", async () => {
      await new Promise(r => setTimeout(r, 20));
      return TraceContext.getTraceId();
    });

    const p2 = TraceContext.run("trace-2", async () => {
      await new Promise(r => setTimeout(r, 10));
      return TraceContext.getTraceId();
    });

    const [res1, res2] = await Promise.all([p1, p2]);
    expect(res1).toBe("trace-1");
    expect(res2).toBe("trace-2");
  });

  it("debe retornar el traceId de OpenTelemetry si hay un span activo", async () => {
    const tracer = opentelemetry.trace.getTracer("test");
    
    await tracer.startActiveSpan("test-span", async (span) => {
      const otelTraceId = span.spanContext().traceId;
      const contextTraceId = TraceContext.getTraceId();
      
      expect(contextTraceId).toBe(otelTraceId);
      span.end();
    });
  });
});
