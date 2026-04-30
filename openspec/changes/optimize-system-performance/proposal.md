# Proposal: Optimize System Performance

## Intent

The "Startup Autónoma" ecosystem currently faces scalability and latency issues due to inefficient state management, synchronous blocking in AI workers, and overhead in communication/persistence layers. This change aims to implement a set of high-impact optimizations to ensure a fluid, production-ready agent experience.

## Scope

### In Scope
- **Frontend Optimization**: Implement atomic Zustand selectors in all dashboard components to prevent unnecessary re-renders.
- **gRPC Resilience**: Configure keepalive parameters and RPC deadlines in the `aiEngineClient` to stabilize communication.
- **Persistence Efficiency**: Transition `SimpleRedisSaver` from JSON to Msgpack/binary serialization to reduce Redis payload size and I/O latency.
- **Python Concurrency**: Refactor AI Engine workers to use `run_in_executor` for CPU-bound tasks, preventing event loop blocking.

### Out of Scope
- Major architectural changes to the LangGraph topology.
- Database migration (Prisma to something else).
- Frontend framework replacement.

## Capabilities

### New Capabilities
- `performance-monitoring`: Infrastructure for tracking latency across gRPC and LangGraph nodes.

### Modified Capabilities
- `core/agent-orchestration`: Optimized state persistence requirements.
- `ai-engine/worker-execution`: Non-blocking execution requirement for workers.

## Approach

1.  **Frontend**: Audit `useAgentStore` usage and replace object destructuring with atomic selectors (e.g., `useAgentStore(s => s.thoughts)`).
2.  **Backend (gRPC)**: Update `grpc.Client` options in `AIEngineClient` with `grpc.keepalive_time_ms` and similar settings.
3.  **Backend (Redis)**: Implement a `MessagePackSerializer` and inject it into `SimpleRedisSaver`.
4.  **AI Engine**: Wrap heavy worker logic in `asyncio.to_thread` or `loop.run_in_executor`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `backend/src/graph/checkpoints/` | Modified | Change serialization logic. |
| `backend/src/services/aiEngineClient.ts` | Modified | Add gRPC config. |
| `frontend/src/store/` | Modified | Atomic selectors refactor. |
| `ai-engine/app/workers/` | Modified | Asynchronous execution patterns. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Binary serialization breaks history | Medium | Implement a migration helper or clear old checkpoints during rollout. |
| React 19 concurrent issues | Low | Verify updates with React Profiler. |

## Rollback Plan

1.  Revert `SimpleRedisSaver` to JSON serialization (Msgpack is backwards-incompatible with JSON data).
2.  Restore previous gRPC client settings.
3.  Revert `useAgentStore` component subscriptions.

## Success Criteria

- [ ] Reduction in frontend re-render frequency by >50% during streaming.
- [ ] Redis payload size for LangGraph state reduced by >30%.
- [ ] No "Event Loop Lag" warnings in OpenTelemetry traces.
