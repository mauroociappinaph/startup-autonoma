# Especificación: Robustecimiento del Control de Ciclos y Telemetría (#127)

## Escenario 1: Incremento del contador de iteraciones
**Given** un estado inicial con `iteration_count` en `X`.
**When** el CEO (o cualquier Chief) termina su ejecución exitosamente.
**Then** el nuevo estado devuelto DEBE tener un `iteration_count` igual a `X + 1`.

## Escenario 2: Acumulación de costos
**Given** un estado inicial con `total_cost_usd` en `Y`.
**When** el nodo procesa una respuesta del LLM con un costo de `Z`.
**Then** el nuevo estado devuelto DEBE tener un `total_cost_usd` igual a `Y + Z`.

## Escenario 3: Telemetría con modelo dinámico
**Given** una llamada al `LLMService` que utiliza un modelo específico (ej: `claude-3-5-sonnet`).
**When** el nodo registra la métrica en el `TelemetryService`.
**Then** el campo `model` enviado al servicio DEBE coincidir con el modelo devuelto por el `LLMService`, no con una cadena estática.

## Escenario 4: Centralización en stateHelper
**Given** la necesidad de actualizar métricas en múltiples nodos.
**When** se implementa el refactor.
**Then** los nodos `ceo`, `software_chief` y `business_chief` DEBEN delegar la preparación del estado de actualización a la función `prepareNodeUpdate` del `stateHelper`.
