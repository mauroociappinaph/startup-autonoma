# Diseño Técnico: Streaming de Pensamientos y Métricas (#128)

## Arquitectura de Eventos

Implementaremos un nuevo tipo de evento en el `EventBus` para evitar colisiones con los eventos de finalización de nodo.

### Nuevo Contrato de Evento: `METRIC_PARTIAL`
```typescript
{
  type: "METRIC_PARTIAL",
  metadata: {
    estimated_tokens: number,
    estimated_cost: number,
    node: string
  }
}
```

## Cambios en el Backend

### 1. `GraphService.ts`
- Introducir un `chunkCounter` para emitir métricas cada N chunks (ej: cada 5).
- Implementar `estimateMetrics(text: string, model: string)` que use la lógica de `TelemetryService.calculateCost` pero con conteo de caracteres.
- Refactorizar el loop de `on_chat_model_stream` para que sea agnóstico a la posición del campo `reasoning` en el JSON.

### 2. `TelemetryService.ts`
- Exponer el método `calculateCost` (ya lo está) para que pueda usarse con valores parciales.

## Cambios en el Frontend

### 1. `agentProcessor.ts`
- Agregar handler para `METRIC_PARTIAL`.
- Este handler llamará a `store.updateTelemetry` sin incrementar el contador de iteraciones (ya que el nodo sigue activo).

### 2. `xmlParser.ts`
- Refactorizar `extractTag` para que acepte tags "abiertos".
- Si no encuentra el tag de cierre `</tag>`, debe retornar todo el texto desde el tag de apertura hasta el final del string.

### 3. `ReasoningFeed.tsx`
- Optimizar el re-renderizado durante el streaming.
- Asegurar que el scroll automático sea suave (CSS `scroll-behavior: smooth`).

## Diagrama de Flujo de Datos

```mermaid
sequencePath
    LLM ->> Backend: Stream Chunk ("...reasoning: 'Analizando")
    Backend ->> Backend: Estimate Tokens (len / 4)
    Backend ->> EventBus: Emit METRIC_PARTIAL
    EventBus ->> Frontend: SSE (METRIC_PARTIAL)
    Frontend ->> Store: updateTelemetry (UI updates Ticker)
    Backend ->> EventBus: Emit Reasoning Chunk (isPartial: true)
    Frontend ->> Store: setThoughts (UI updates Feed)
```

## Consideraciones de Performance
- El throttling en el backend es CRÍTICO. No queremos enviar 1000 eventos por segundo si el LLM es muy rápido.
- Usaremos un acumulador de tiempo o de chunks para emitir métricas.
