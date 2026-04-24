# Propuesta: Robustecimiento del Control de Ciclos y Telemetría Dinámica (#127)

Esta propuesta busca solucionar la degradación del control de recursión en el grafo y la falta de precisión en la telemetría de costos, centralizando la lógica de actualización de métricas del estado.

## User Review Required

> [!IMPORTANT]
> Se introducirá una función helper centralizada para las actualizaciones de estado de los nodos. Esto cambiará ligeramente el patrón de retorno en `ceo_node`, `software_chief_node` y `business_chief_node`.

## Proposed Changes

### Core Logic

#### [NEW] `backend/src/helpers/stateHelper.ts`
Implementar `prepareNodeUpdate` que acepte el estado actual, la respuesta del LLM (incluyendo uso y modelo) y retorne un objeto parcial de `AgentStateType` con:
- `iteration_count` incrementado correctamente.
- `total_cost_usd` y `token_usage` actualizados.
- Integración automática con `TelemetryService` y `AuditService`.

### Nodes Refactor

#### [MODIFY] `backend/src/nodes/ceo.ts`
#### [MODIFY] `backend/src/nodes/chiefs/software_chief.ts`
#### [MODIFY] `backend/src/nodes/chiefs/business_chief.ts`
Refactorizar para usar el nuevo helper, eliminando código duplicado de telemetría y auditoría, y corrigiendo el reset del `iteration_count`.

## Verification Plan

### Automated Tests
- Ejecutar `npm run test --prefix backend` para asegurar que los agentes sigan delegando correctamente.
- Crear un nuevo test unitario para el `stateHelper` que verifique el incremento matemático del contador.

### Manual Verification
- Verificar en los logs de la consola que el `iteration_count` aumente en cada paso durante una ejecución de prueba.
