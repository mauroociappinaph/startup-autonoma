# Design: Distributed Tracing with OpenTelemetry (Issue #105)

## Technical Approach
We will replace the manual `TraceContext` logic with the official OpenTelemetry SDK for Node.js and Python. We will use **Manual Instrumentation** to capture the hierarchical reasoning of the agents (CEO -> Chiefs -> Workers) which auto-instrumentation misses. Spans will be exported via OTLP to a local Jaeger instance.

## Architecture Decisions

### Decision: OpenTelemetry SDK vs. Manual Headers
**Choice**: OpenTelemetry SDK.
**Alternatives considered**: Manual `AsyncLocalStorage` (current state).
**Rationale**: OpenTelemetry is the industry standard. It provides native support for span hierarchies, visualization (Jaeger), and standardized context propagation across gRPC metadata, which is much more robust than our current manual UUID passing.

### Decision: Local Jaeger Collector
**Choice**: Jaeger (All-in-one) in Docker.
**Alternatives considered**: Honeycomb/Datadog (SaaS).
**Rationale**: For development and the current stage of the Startup, a local collector is faster, cheaper ($0), and ensures privacy of the agentic reasoning logs.

## Data Flow
The Trace ID is generated at the `aduana_sentinel` (entry point) and propagated through the graph. When a Chief calls a Worker in Python via gRPC, the context is injected into the metadata headers.

```text
[Backend: LangGraph]
   aduana_sentinel (Root Span)
      └── ceo (Child Span)
          └── software_chief (Child Span)
               └── [gRPC Client Call] (Inject Metadata)
                         │
[gRPC Network Boundary] ──┼──> [Metadata: traceparent=...]
                         │
[AI-Engine: Python]      └── ExecuteWorkerTask (Extract Context)
                               └── lead_gen_worker (Sub-span)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `backend/src/services/telemetryService.ts` | Modify | Initialize OTel SDK and provide `getTracer()` helper. |
| `backend/src/services/traceContext.ts` | Modify | Bridge OTel context with current `AsyncLocalStorage` or replace it. |
| `backend/src/services/llmService.ts` | Modify | Wrap `invoke` in a span with attributes (tokens, model). |
| `backend/src/graph/index.ts` | Modify | Wrap the graph execution and node calls in spans. |
| `ai-engine/app/core/grpc_server.py` | Modify | Use `opentelemetry` to extract context and start server spans. |
| `ai-engine/app/workers/lead_gen_worker.py` | Modify | Add manual spans for internal reasoning steps. |
| `docker-compose.yml` | Modify | Add `jaegertracing/all-in-one` service. |

## Interfaces / Contracts

### gRPC Metadata Propagation (W3C Trace Context)
We will follow the `traceparent` header format:
`00-{trace-id}-{span-id}-{flags}`

### Node.js Trace Helper
```typescript
// telemetryService.ts
export const tracer = opentelemetry.trace.getTracer('startup-autonoma');

export function traceStep<T>(name: string, fn: (span: Span) => Promise<T>): Promise<T> {
  return tracer.startActiveSpan(name, (span) => {
    try {
      return fn(span);
    } finally {
      span.end();
    }
  });
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Context Extraction | Mock gRPC metadata and verify OTel context is populated in Python. |
| Integration | Cross-service flow | Run a test-workflow and verify Trace ID consistency in Jaeger. |
| E2E | Full Trace | Verify that a single Trace ID covers from Sentinel to Worker response. |

## Migration / Rollout
No data migration required. The change is additive. We will enable it via `OTEL_ENABLED=true` env var.

## Open Questions
- [ ] Should we also trace Redis calls? (Recommended: Yes, via auto-instrumentation).
- [ ] Do we need to mask sensitive data in span attributes (e.g., prompt content)? (Decision: Yes, truncate or mask large strings).
