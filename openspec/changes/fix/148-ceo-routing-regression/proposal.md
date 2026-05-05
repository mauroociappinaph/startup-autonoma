# Proposal: Fix CEO Routing Regression and Domain Guardrails

## Intent

Solucionar la regresión técnica en el Nodo CEO que causa fallos en la delegación hacia el `operations_chief`. Asegurar que los Domain Guardrails definidos en la Issue #148 se apliquen de forma determinista y que los tests de integración validen correctamente este comportamiento.

## Scope

### In Scope
- Refactorización de la lógica de ruteo en `backend/src/nodes/ceo.ts`.
- Actualización del test de integración `backend/src/tests/ceo_routing.test.ts`.
- Asegurar la compatibilidad del esquema `CEOResponseSchema` con el mapeo del estado.

### Out of Scope
- Rediseño del prompt del CEO más allá de los guardrails de dominio.
- Cambios en los otros jefes de área (Software/Business).

## Capabilities

### New Capabilities
None

### Modified Capabilities
- `orchestration/agent-delegation`: Refinamiento de la lógica de delegación para incluir restricciones de acceso a archivos basadas en el dominio.

## Approach

Se corregirá el mapeo de `response.delegated_to` en el nodo CEO para asegurar que el valor se propague correctamente al campo `active_chief` del estado. Se actualizará el test de routing para usar el nuevo estándar de ESM en Jest y mockear correctamente el `LLMService` de forma que los resultados sean deterministas.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `backend/src/nodes/ceo.ts` | Modified | Corrección en la lógica de asignación de `active_chief`. |
| `backend/src/tests/ceo_routing.test.ts` | Modified | Actualización para corregir fallos de ESM y validación de delegación. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Regresión en delegación a otros jefes | Low | Ejecutar suite completa de tests de routing. |
| Incompatibilidad de tipos en el estado | Low | Validación estricta con Zod en la salida del nodo. |

## Rollback Plan

Revertir los cambios en `backend/src/nodes/ceo.ts` y restaurar los tests a la versión previa.

## Dependencies

- `packages/shared`: El contrato `CEOResponseSchema` debe estar sincronizado.

## Success Criteria

- [ ] El test `ceo_routing.test.ts` pasa exitosamente.
- [ ] La delegación al `operations_chief` resulta en un campo `active_chief` correctamente poblado.
- [ ] Se cumple con el tipado estricto (No Any).
