# Orchestration: Agent Delegation Specification

## Purpose
Define el comportamiento de la delegación jerárquica entre agentes (CEO, Chiefs y Workers) para asegurar un flujo de trabajo eficiente, libre de bucles infinitos y con gestión de estado determinista.

## Requirements

### Requirement: Idempotencia de Delegación
El sistema SHALL evitar delegaciones redundantes a un mismo dominio si el objetivo ya fue satisfecho en el historial de ejecución.

#### Scenario: Detección de Tarea Completada
- GIVEN un CEO que analiza una misión de "Documentación".
- AND el historial contiene un mensaje de éxito del `DocumentationWorker`.
- AND el `SoftwareChief` ha reportado la misión como `complete`.
- WHEN el CEO procesa el siguiente paso.
- THEN el CEO MUST elegir `finish` en lugar de volver a delegar al `SoftwareChief`.

### Requirement: Gestión Determinista del Estado de Control
El estado del grafo MUST permitir la limpieza explícita de los campos de control (`active_chief` y `next_node`) para evitar ciclos de retorno involuntarios.

#### Scenario: Limpieza de Jefe Activo
- GIVEN un `SoftwareChief` que ha terminado su sub-misión.
- WHEN el nodo retorna una actualización con `active_chief: undefined`.
- THEN el reducer de estado MUST actualizar el valor a `undefined` (limpiando el campo).
- AND el `circuit_breaker` MUST redirigir al `ceo` como fallback por defecto.

### Requirement: Razonamiento Contextual (CoT)
Todo agente Chief o CEO MUST realizar un análisis de progreso antes de cada decisión técnica.

#### Scenario: Validación de Progreso en CEO
- GIVEN un CEO recibiendo el control de un Chief.
- WHEN analiza el historial de mensajes.
- THEN el CEO MUST identificar explícitamente en su `<thought>` qué partes del plan original han sido completadas basándose en los resultados de los workers.
