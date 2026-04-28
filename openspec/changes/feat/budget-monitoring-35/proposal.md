# Proposal: Monitoreo de Presupuesto en USD (Issue #35)

## Intent
Evitar el riesgo financiero de la startup autónoma mediante un control estricto de gasto en USD. Actualmente solo se miden tokens, lo que no refleja el costo real de los modelos (p.ej. GPT-4o vs GPT-4o-mini).

## Scope
### In Scope
- Integración de `maxUsdBudget` en el contrato de proyecto.
- Validación de gasto acumulado en USD dentro del `BudgetService`.
- Corte de ejecución por el `Circuit Breaker` ante exceso de gasto.
- Emisión de eventos de alerta (80%, 90%) en USD.

### Out of Scope
- Gestión de pagos o recarga de saldo.
- Histórico de costos por usuario (solo por proyecto).

## Capabilities
### New Capabilities
- `budget-control`: Gestión centralizada de cuotas financieras y límites de seguridad.

### Modified Capabilities
- `observability/logging`: Inclusión de métricas financieras en los streams de eventos.

## Approach
Se extenderá el `BudgetService` para que consulte al `TelemetryService` el gasto acumulado en Redis. El `Circuit Breaker` actuará como el guardián final antes de cada iteración del CEO.

## Affected Areas
| Area | Impact | Description |
|------|--------|-------------|
| `packages/shared/src/types/Project.types.ts` | Modified | Nuevo campo `maxUsdBudget`. |
| `backend/src/services/BudgetService.ts` | Modified | Lógica de validación de USD. |
| `backend/src/nodes/circuit_breaker.ts` | Modified | Reporte de error financiero. |

## Risks
| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Falsos positivos por latencia en Redis | Low | Uso de operaciones atómicas (`INCRBYFLOAT`). |

## Rollback Plan
Revertir cambios en el `shared` package y el `circuit_breaker.ts` para volver al monitoreo exclusivo de tokens.

## Success Criteria
- [ ] El sistema detiene la ejecución si el costo acumulado supera el `maxUsdBudget`.
- [ ] Se emiten alertas al 90% del presupuesto en USD vía `EventBus`.
