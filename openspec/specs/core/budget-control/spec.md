# Spec: Budget Control

## Purpose
Garantizar la estabilidad financiera de la startup mediante la gestión de límites de consumo (tokens y USD) por proyecto.

## Requirements

### Requirement: Hard Limit Enforcement
El sistema DEBE detener la ejecución de cualquier agente si el consumo acumulado del proyecto supera el `maxUsdBudget` configurado.

#### Scenario: Gasto excedido en iteración
- GIVEN un proyecto con `maxUsdBudget` de $0.05.
- AND un gasto acumulado de $0.06.
- WHEN el `circuit_breaker` evalúa el estado.
- THEN el sistema DEBE retornar `max_budget_reached: true`.
- AND DEBE concatenar un mensaje de error explicando que se alcanzó el límite financiero.

### Requirement: Proactive USD Alarms
El sistema DEBE emitir alertas de advertencia cuando el consumo de USD alcance umbrales críticos.

#### Scenario: Alerta del 90% alcanzada
- GIVEN un proyecto con `maxUsdBudget` de $10.00.
- AND un gasto acumulado de $9.10.
- WHEN se registra nuevo consumo.
- THEN el sistema DEBE publicar un evento de tipo `CRITICAL` vía `EventBus`.
- AND el mensaje DEBE indicar que se alcanzó el 90% del límite de USD.
