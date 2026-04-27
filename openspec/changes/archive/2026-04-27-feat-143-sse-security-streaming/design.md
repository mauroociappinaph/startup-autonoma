# Diseño Técnico: SSE Security Streaming (#143)

## Análisis del Bug

El `AduanaSentinel` publica el evento usando `state.trace_id`:

```ts
// BUG: usa trace_id que puede ser undefined o diferente al threadId del cliente
threadId: state.trace_id || "unknown"
```

El cliente SSE se suscribe usando el `threadId` del `AgentController`:

```ts
// agentController.ts
const resolvedSessionId = sessionId ? String(sessionId) : threadId ? ...
const unsubscribe = await EventBus.subscribe(resolvedSessionId, ...);
```

El grafo de LangGraph recibe el `threadId` via `config.configurable.thread_id`.
El nodo necesita acceder a ese valor desde el estado del grafo.

## Decisión de Arquitectura

### D1: Usar `thread_id` del estado compartido
El campo `thread_id` ya existe en `AgentStateType` (verificado en `@startup/shared`).
El `GraphService.runAgentStream` inicializa el grafo con `thread_id` en el config.
La solución correcta es que el nodo use el `thread_id` que ya está en el estado,
**no** el `trace_id` que es un campo de trazabilidad diferente.

**Fix**: Cambiar `state.trace_id || "unknown"` por `state.thread_id || "unknown"`.

### D2: Migrar console.error a SacredLogger
El `catch` del Sentinel tiene un `console.error` residual que viola la Ley #14.
Se migrará a `SacredLogger.error` pasando el objeto de error para capturar el stack trace.

### D3: Test usando spy de EventBus
El test no llamará a ningún LLM real. Mockeará `LLMService.getStructuredData` para
controlar la respuesta y espiará `EventBus.publish` para verificar que el evento
correcto llega al canal correcto.

## Archivos Afectados

- `backend/src/nodes/mirror/aduana_sentinel_node.ts` [MODIFY] — Fix threadId + SacredLogger
- `backend/src/tests/aduana_sentinel_node.test.ts` [MODIFY] — Nuevos escenarios de SSE
