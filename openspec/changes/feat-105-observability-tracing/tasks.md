# Tasks: Distributed Tracing with OpenTelemetry (Issue #105)

## Phase 1: Infrastructure & Environment Setup

- [x] 1.1 Add `@opentelemetry/sdk-node`, `@opentelemetry/api`, `@opentelemetry/exporter-trace-otlp-http` to `backend/package.json`.
- [x] 1.2 Add `opentelemetry-sdk`, `opentelemetry-api`, `opentelemetry-exporter-otlp` to `ai-engine/pyproject.toml`.
- [x] 1.3 Add Jaeger service to `docker-compose.yml` (jaegertracing/all-in-one).
- [x] 1.4 Update `backend/src/services/telemetryService.ts` to initialize OpenTelemetry SDK.

## Phase 2: Backend Instrumentation (Node.js)

- [ ] 2.1 Update `backend/src/services/traceContext.ts` to use OpenTelemetry context instead of manual UUID.
- [ ] 2.2 Update `backend/src/services/llmService.ts` to wrap `invoke` and `getStructuredData` in spans with model/token attributes.
- [ ] 2.3 Update `backend/src/graph/index.ts` to wrap node executions in spans using a custom middleware or direct wrapping.
- [ ] 2.4 Update `backend/src/services/loggerService.ts` to inject the current `trace_id` into Winston logs.

## Phase 3: Cross-Service Propagation (gRPC)

- [ ] 3.1 Update `backend/src/services/aiEngineClient.ts` to inject `traceparent` metadata into gRPC calls.
- [ ] 3.2 Update `ai-engine/app/core/grpc_server.py` to extract context and start a server span.

## Phase 4: AI Engine Instrumentation (Python)

- [ ] 4.1 Update `ai-engine/app/workers/lead_gen_worker.py` to add sub-spans for internal processing steps.
- [ ] 4.2 Verify Trace ID consistency between Node.js and Python logs.

## Phase 5: Verification & Testing

- [ ] 5.1 Test: Verify `aduana_sentinel` generates the Root Span.
- [ ] 5.2 Test: Verify `LLMService` spans contain token usage attributes.
- [ ] 5.3 Test: Verify Jaeger UI shows a single trace for a full graph execution.
- [ ] 5.4 Test: Verify `SacredLogger` includes `trace_id` in terminal output.
