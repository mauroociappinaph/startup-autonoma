# Design: feat-143-sentinel-sse

## Architecture Decision

### Emit-from-Node vs GraphFormatter

Elegimos **Emit-from-Node** (Opción 2).

| Criterio | GraphFormatter | Emit-from-Node |
|---|---|---|
| Inmediatez | Solo cuando el ciclo de update llega al formatter | Antes de retornar el state update |
| Testabilidad | Acoplado al ciclo completo del grafo | Testeable en aislamiento del nodo |
| Riesgo de duplicados | No | No (único punto de emisión) |
| Consistencia con codebase | GraphFormatter solo lee `messages` | TelemetryService ya usa EventBus directamente |

### threadId Source

El `threadId` para `EventBus.publish()` viene de `state.trace_id`. Este campo es poblado por el `GraphService` al inicio de cada run. La firma de índice `[key: string]: unknown` ya existe en `AgentStateType`, por lo tanto no hay problema de compatibilidad de tipos.

---

## Component Design

### 1. `stream.types.ts` — Nuevos tipos

```typescript
// Nuevo tipo: evento de seguridad estructurado
export interface SecurityAnalysisEvent {
  type: "SECURITY_ANALYSIS";
  agent: "ADUANA_SENTINEL";
  threat_level: "none" | "low" | "medium" | "high" | "critical";
  decision: "pass" | "block";
  reasoning: string;
  latency_ms: number;
  threadId: string;
}

// Modificación: agregar checkpointId a StreamEvent
export interface StreamEvent {
  // ... existing fields ...
  checkpointId?: string; // NUEVO: fix de type mismatch existente
}
```

### 2. `AgentState.types.ts` — Nuevo campo

```typescript
threat_level?: "none" | "low" | "medium" | "high" | "critical";
```

Se agrega junto a `is_malicious` y `security_report`. Permite consultas de historial por nivel de amenaza.

### 3. `aduana_sentinel_node.ts` — Lógica de emisión

```typescript
// Antes de retornar `updates`:
const securityEvent: SecurityAnalysisEvent = {
  type: "SECURITY_ANALYSIS",
  agent: "ADUANA_SENTINEL",
  threat_level: result.threat_level,
  decision: result.is_injection ? "block" : "pass",
  reasoning: result.reasoning,
  latency_ms: latency,
  threadId: state.trace_id ?? "unknown"
};

await EventBus.publish(state.trace_id ?? "unknown", securityEvent);
```

**El `updates` también agrega `threat_level` al estado:**
```typescript
const updates: Partial<AgentStateType> = {
  ...metricsUpdate,
  is_malicious: result.is_injection,
  threat_level: result.threat_level, // NUEVO
  security_report: result.reasoning,
  ...
};
```

### 4. `graphFormatter.ts` — Fallback mapping

Se agrega un segundo `yield` dentro de `formatUpdate()` para cuando el update contiene `is_malicious`:

```typescript
// NUEVO: Fallback para el evento de seguridad
if (nodeData.is_malicious !== undefined && nodeData.security_report) {
  yield {
    agent: "ADUANA_SENTINEL",
    text: nodeData.security_report,
    time: new Date().toLocaleTimeString(),
    activeNode: nodeName,
    threadId
  } as StreamEvent;
}
```

---

## Data Flow

```
User prompt
    │
    ▼
aduana_sentinel_node
    │
    ├── LLMService.getStructuredData() ──► { is_injection, threat_level, reasoning, latency }
    │
    ├── EventBus.publish(trace_id, SecurityAnalysisEvent) ──► Redis Pub/Sub + Buffer
    │                                                              │
    │                                                              ▼
    │                                                     SSE client receives
    │                                                     SECURITY_ANALYSIS event
    │
    └── return state update (is_malicious, threat_level, security_report)
              │
              ▼
         LangGraph checkpoint (Redis)
              │
              ▼
         GraphFormatter (secondary signal for dashboard)
```

---

## Test Strategy

Strict TDD activo. Para cada escenario:

**RED → GREEN → TRIANGULATE**

### Escenarios de test (nuevos):

1. **`aduana_sentinel_node.test.ts`** (nuevo archivo):
   - ✅ Prompt limpio → emite evento con `decision: "pass"`, `threat_level: "none"`
   - ✅ Prompt malicioso → emite evento con `decision: "block"`, `threat_level: "high"`
   - ✅ Fallo de LLM → NO emite evento, retorna `is_malicious: false` (conservador)
   - ✅ `state.trace_id` undefined → emite evento con `threadId: "unknown"`
   - ✅ Estado resultante contiene `threat_level`

2. **`graphFormatter.test.ts`** (nuevo o extendido):
   - ✅ Update con `is_malicious: true` → yield del evento de seguridad como `StreamEvent`
   - ✅ Update con `is_malicious: false` → yield igualmente (observabilidad siempre activa)
   - ✅ Update sin `is_malicious` → no yield del evento de seguridad (no rompe flujo normal)
