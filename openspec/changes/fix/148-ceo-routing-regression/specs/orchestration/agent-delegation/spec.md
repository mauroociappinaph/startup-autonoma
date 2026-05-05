# Delta for Orchestration: Agent Delegation

## ADDED Requirements

### Requirement: Enforcement de Alineación de Dominio
El sistema SHALL restringir las capacidades de cada Agente Chief basándose estrictamente en su dominio de responsabilidad para evitar desajustes arquitectónicos.

#### Scenario: Restricción de Dominio para Operations Chief
- GIVEN un CEO delegando una tarea de "Arquitectura de Observabilidad".
- WHEN el CEO genera el plan y la delegación.
- THEN el CEO MUST restringir al `Operations Chief` al dominio de `/infra`, `docker-compose.yml` y generación de diagramas en `/docs/architecture`.
- AND el CEO SHALL prohibir explícitamente al `Operations Chief` la modificación de código en `/src` o `/packages`.

## MODIFIED Requirements

### Requirement: Gestión Determinista del Estado de Control
El estado del grafo MUST permitir la limpieza explícita de los campos de control (`active_chief`, `next_node` y `plan`) para evitar ciclos de retorno involuntarios, y asegurar el mapeo correcto de delegaciones activas.
(Previously: Gestión Determinista del Estado de Control se enfocaba solo en la limpieza al finalizar.)

#### Scenario: Limpieza de Estado en CEO al Finalizar
- GIVEN un CEO que decide finalizar la misión (`next_step: "finish"`).
- WHEN el CEO actualiza el estado.
- THEN el sistema MUST forzar `active_chief: undefined`, `next_node: undefined` y `plan: []`.
- AND estas actualizaciones MUST realizarse incluso si el LLM retorna alucinaciones en campos de delegación.
- AND el `circuit_breaker` MUST redirigir al nodo `END` al detectar el estado de control vacío.

#### Scenario: Mapeo de Delegación Activa
- GIVEN un CEO que decide delegar una tarea (`next_step: "delegate"`).
- AND el LLM selecciona un jefe en `delegated_to` (ej: `operations_chief`).
- WHEN el CEO actualiza el estado.
- THEN el sistema MUST asignar exactamente el valor de `delegated_to` al campo `active_chief` del estado.
- AND si `delegated_to` es `undefined` o alucinado, el sistema SHALL capturar el error y NO delegar (permitiendo reintento o terminación conservadora).
