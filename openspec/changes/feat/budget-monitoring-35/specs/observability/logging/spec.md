# Delta for observability/logging

## ADDED Requirements

### Requirement: Financial Event Logging
El sistema DEBE incluir información de costo en USD en los eventos de métricas publicados.

#### Scenario: Reporte de métricas con costo
- GIVEN un nodo que acaba de finalizar su ejecución.
- WHEN el `TelemetryService` registra la métrica.
- THEN el evento publicado DEBE incluir el campo `cost` en la metadata.
- AND el log de consola DEBE mostrar el costo con al menos 6 decimales.
