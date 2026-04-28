## Exploration: Monitoreo de Presupuesto en USD (Issue #35)

### Current State
El sistema actual utiliza el `BudgetService` para monitorear el consumo de tokens comparándolos con el `maxTokenBudget` definido en el contexto del proyecto. El `TelemetryService` ya calcula y persiste el costo en USD en Redis (`total_cost_usd`), pero esta información no se utiliza actualmente para bloquear la ejecución.

### Affected Areas
- `packages/shared/src/types/Project.types.ts` — Necesita el campo `maxUsdBudget`.
- `backend/src/services/BudgetService.ts` — Debe integrar la validación de USD.
- `backend/src/nodes/circuit_breaker.ts` — Debe reportar el estado de USD al usuario.

### Approaches
1. **Enfoque A: Unificación en BudgetService** — El `BudgetService` consulta al `TelemetryService` para obtener el gasto acumulado y decide si se alcanzó el límite.
   - Pros: Centralización de reglas de negocio, logs consistentes.
   - Cons: Dependencia entre servicios.
   - Effort: Low

2. **Enfoque B: Validación en Circuit Breaker** — El nodo de Circuit Breaker consulta ambos servicios por separado.
   - Pros: Desacoplamiento.
   - Cons: Lógica de "porcentaje de alerta" (80/90%) duplicada o dispersa.
   - Effort: Medium

### Recommendation
Se recomienda el **Enfoque A**. El `BudgetService` es conceptualmente el lugar donde deben vivir las políticas de cuotas y límites de la startup autónoma.

### Risks
- Discrepancias menores de redondeo entre el cálculo en memoria y lo persistido en Redis (Mitigado por el uso de `hincrbyfloat`).

### Ready for Proposal
Yes.
