# Proposal: feat(aduana-sentinel): Emitir eventos de seguridad vía SSE (#143)

## Intent
El `aduana_sentinel_node` ya analiza y bloquea amenazas correctamente, pero el cliente SSE es ciego a esa decisión. El usuario no sabe si su prompt fue evaluado, cuál fue el nivel de amenaza, ni si fue bloqueado — el stream simplemente salta a `circuit_breaker`. Necesitamos cerrar ese gap de observabilidad emitiendo un evento `SECURITY_ANALYSIS` estructurado.

## Scope
- Nuevo tipo `SecurityAnalysisEvent` en `stream.types.ts`
- Nuevo campo `threat_level` en `AgentStateType` (el Sentinel ya lo detecta pero no lo escribe al estado)
- `aduana_sentinel_node`: emitir via `EventBus.publish()` directamente (opción más simple y robusta que pasar por `GraphFormatter`)
- `GraphFormatter`: agregar soporte para mapear `is_malicious` / `security_report` como fallback si el evento de bus falla
- Tests unitarios con Strict TDD

## Approach
**Opción elegida: Emit-from-node** (Opción 2 del issue)

El Sentinel emite el evento SSE directamente via `EventBus.publish()` antes de retornar el state update. Esto es:
- Más inmediato (no depende del ciclo de polling del `GraphFormatter`)
- Consistente con cómo `TelemetryService` ya publica eventos directamente
- Más fácil de testear en aislamiento
- No requiere modificar el contrato del estado para emitir

El `GraphFormatter` se actualiza como segunda línea de defensa (fallback/visualización en el dashboard).
