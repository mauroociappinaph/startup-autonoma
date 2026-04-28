# Design: Monitoreo de Presupuesto en USD (Issue #35)

## Technical Approach
Se implementará una validación financiera centralizada en el `BudgetService`. Este servicio consultará las estadísticas acumuladas en Redis mantenidas por el `TelemetryService` para realizar comparativas contra el nuevo límite `maxUsdBudget`.

## Architecture Decisions

### Decision: Fuente de Verdad Financiera
**Choice**: Usar el `TelemetryService` y su persistencia en Redis.
**Alternatives considered**: Hacer que `BudgetService` mantenga su propio contador de USD.
**Rationale**: El `TelemetryService` ya cuenta con la lógica precisa de cálculo de costos (6 decimales) y persistencia atómica. Duplicar esta lógica en `BudgetService` introduciría riesgo de desincronización y deuda técnica.

### Decision: Estrategia de Alertas
**Choice**: Alertas asíncronas vía `EventBus`.
**Rationale**: Permite que el sistema notifique al usuario/frontend en tiempo real sin bloquear el flujo principal del grafo, excepto cuando se alcanza el Hard Limit.

## Data Flow
```text
[Graph Node] ──> TelemetryService.recordMetric() ──> [Redis: stats]
      │
[Circuit Breaker] ──> BudgetService.checkSecurityStatus()
      │                        │
      │                        └──> TelemetryService.getProjectStats() ──> [Redis: stats]
      ▼
[CEO / Stop]
```

## File Changes
| File | Action | Description |
|------|--------|-------------|
| `packages/shared/src/types/Project.types.ts` | Modify | Extensión del contrato Zod con `maxUsdBudget`. |
| `backend/src/services/BudgetService.ts` | Modify | Implementación de `checkSecurityStatus` con lógica de USD. |
| `backend/src/nodes/circuit_breaker.ts` | Modify | Integración de la validación financiera y logs detallados. |
| `backend/src/tests/budget_usd.test.ts` | Create | Unit/Integration testing para el flujo financiero. |

## Testing Strategy
| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `BudgetService` | Mockear `TelemetryService` para simular excesos de presupuesto. |
| Integration | `Circuit Breaker` | Ejecutar el nodo con un contexto de proyecto que tenga presupuesto agotado. |
