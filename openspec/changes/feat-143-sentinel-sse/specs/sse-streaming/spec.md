# Delta Spec: feat-143-sentinel-sse
Domain: sse-streaming

## Context
Extends the existing SSE streaming spec to add a dedicated security event emitted by the Aduana Sentinel.

---

## ADDED Requirements

### Requirement: Security Analysis SSE Event
Every execution of `aduana_sentinel_node` MUST emit a `SECURITY_ANALYSIS` event to the SSE stream via `EventBus.publish()`.

**Event shape:**
```typescript
{
  type: "SECURITY_ANALYSIS",
  agent: "ADUANA_SENTINEL",
  threat_level: "none" | "low" | "medium" | "high" | "critical",
  decision: "pass" | "block",
  reasoning: string,        // The sentinel's analysis reasoning
  latency_ms: number,
  threadId: string
}
```

**Invariants:**
- The event MUST be emitted regardless of whether the threat is detected or not (both `pass` and `block` decisions emit an event).
- The event MUST be emitted BEFORE the state update is returned to LangGraph.
- If `is_injection === true`, `decision` MUST be `"block"`. Otherwise `"pass"`.
- The `threadId` MUST come from `state.trace_id` (populated by the graph runner at start).
- If `state.trace_id` is undefined, the event MUST still be emitted with `threadId: "unknown"` (no silent failures).
- The event MUST be included in the replay buffer (handled automatically by `EventBus.publish()`).

### Requirement: threat_level in AgentState
`AgentStateType` MUST include `threat_level` as an optional string field persisted from the Sentinel to the LangGraph state checkpoint.

**Field definition:**
```typescript
threat_level?: "none" | "low" | "medium" | "high" | "critical";
```

**Rationale:** The field is already computed by the Sentinel and written to `security_report`, but not persisted as a discrete queryable field. This enables dashboard filtering and history queries.

### Requirement: SecurityAnalysisEvent type
A new exported type `SecurityAnalysisEvent` MUST be added to `stream.types.ts`:

```typescript
export interface SecurityAnalysisEvent {
  type: "SECURITY_ANALYSIS";
  agent: "ADUANA_SENTINEL";
  threat_level: "none" | "low" | "medium" | "high" | "critical";
  decision: "pass" | "block";
  reasoning: string;
  latency_ms: number;
  threadId: string;
}
```

### Requirement: GraphFormatter Security Mapping (Fallback)
`GraphFormatter.formatUpdate()` MUST yield a `StreamEvent` when the node update contains `is_malicious` and `security_report` fields, as a secondary signal for dashboard rendering.

---

## MODIFIED Requirements

### Requirement: StreamEvent type (existing)
Add `checkpointId` to `StreamEvent` interface (it was used in `GraphFormatter` but missing from the type):

```typescript
checkpointId?: string;
```
