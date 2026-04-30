# Design: System Performance Optimization

## Technical Approach

The overall strategy is to eliminate synchronous bottlenecks and reduce I/O overhead. This maps to the proposal's multi-layer approach:
- **Frontend**: Transition from "Whole Store Consumption" to "Atomic Selectors" in React 19.
- **Backend (gRPC)**: Stabilize AI Engine communication with keepalive.
- **Backend (Persistence)**: Optimize checkpoint size via binary serialization (Msgpack).
- **AI Engine**: Offload heavy worker logic to threads to keep the event loop free.

## Architecture Decisions

### Decision: Binary Serialization for Checkpoints

**Choice**: MessagePack (Msgpack) via `msgpack-lite` (Node) and `msgpack-python` (Python).
**Alternatives considered**: JSON (current), Protobuf, Avro.
**Rationale**: Msgpack is a schemaless binary format that provides a 30-50% size reduction compared to JSON with minimal CPU overhead. Unlike Protobuf, it doesn't require pre-defined schemas for the entire LangGraph state, which is dynamic.

### Decision: Concurrency in AI Engine

**Choice**: `asyncio.to_thread` for worker methods.
**Alternatives considered**: `ProcessPoolExecutor`, `Celery`.
**Rationale**: AI Engine workers are predominantly calling LLM APIs (I/O) or C-extensions (ML), which release the GIL. Threads are lighter and avoid the overhead of process management for now.

### Decision: Zustand Subscription Pattern

**Choice**: Atomic Selectors (e.g., `useAgentStore(s => s.thoughts)`).
**Alternatives considered**: `useAgentStore()`, `shallow` equality.
**Rationale**: Standard Zustand practice. Avoids re-rendering the whole dashboard when only one metric (e.g., cost) updates.

## Data Flow

    Frontend (Atomic Selectors) ──→ Zustand Store ──→ React Components (Targeted Re-render)
          ↑
    Backend (Event Bus/SSE) ──→ Msgpack Serializer ──→ Redis (Checkpoint)
          ↑
    gRPC (Keepalive) ──→ AI Engine (FastAPI + Threads)

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `backend/src/graph/serializers/MsgpackSerializer.ts` | Create | New binary serializer for LangGraph. |
| `backend/src/graph/checkpoints/SimpleRedisSaver.ts` | Modify | Use MsgpackSerializer instead of default JSON. |
| `backend/src/services/aiEngineClient.ts` | Modify | Add `grpc.keepalive_time_ms` and `grpc.keepalive_timeout_ms`. |
| `ai-engine/app/workers/lead_gen_worker.py` | Modify | Wrap execution logic in `asyncio.to_thread`. |
| `frontend/src/components/dashboard/*.tsx` | Modify | Refactor `useAgentStore` calls to use selectors. |

## Interfaces / Contracts

### gRPC Client Config
```typescript
const options = {
  'grpc.keepalive_time_ms': 10000,
  'grpc.keepalive_timeout_ms': 5000,
  'grpc.keepalive_permit_without_calls': 1,
  'grpc.http2.max_pings_without_data': 0,
  'grpc.http2.min_time_between_pings_ms': 10000,
  'grpc.http2.min_ping_interval_without_data_ms': 5000,
};
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Msgpack Serializer | Encode/Decode state objects and compare with JSON. |
| Integration | gRPC Timeout | Mock network delay and verify client deadline triggers. |
| Performance | Render Count | Use React DevTools to verify targeted re-renders. |

## Migration / Rollout

**No data migration required for development**. In production, we should clear the `checkpoint:*` keys in Redis before deploying the Msgpack change to avoid deserialization errors, or implement a "format-aware" loader.

## Open Questions

- [ ] Should we use `pako` (Gzip) on top of Msgpack for extremely large message histories? (Deferred to P2).
