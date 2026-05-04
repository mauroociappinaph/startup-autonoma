# Proposal: Fase C - Infraestructura, Operaciones y Resiliencia (Docker & Visibility)

## Goal
Completar la Fase C de la Startup Autónoma, transformando la infraestructura dockerizada en un estándar de calidad obligatorio y mejorando la visibilidad del grafo mediante la integración de diagramas de secuencia en tiempo real y monitoreo de salud.

## Impact Analysis
- **Infraestructura**: El hook de pre-push será más estricto, requiriendo que los servicios base estén sanos.
- **Frontend**: Nuevo componente para visualizar diagramas Mermaid y estados de salud de los nodos.
- **Backend**: Mejoras en el Operations Chief para actuar como orquestador de observabilidad.

## Proposed Changes

### [Infraestructura]
- **Robustecer `scripts/check-docker.js`**: Implementar chequeos de conectividad reales para Postgres y Redis, no solo presencia de contenedores.
- **Pre-push Guard**: Configurar el hook para que sea un bloqueador si falla el healthcheck de infraestructura crítica.

### [Frontend - Mission Control]
- **Sequence Diagram Viewer**: Integrar `mermaid-react` para renderizar los diagramas generados por el Operations Worker directamente en el Dashboard.
- **Node Health Monitoring**: Mostrar indicadores visuales de latencia y estado (vía Jaeger/OpenTelemetry) en cada nodo del `OrchestrationGraph`.

### [Backend - Operations]
- **Enhanced Operations Worker**: Permitir que el worker reporte métricas de salud detalladas al estado del grafo para su visualización.
- **Self-Healing Triggers**: (Opcional/Futuro) Lógica básica para reiniciar contenedores o limpiar caches de Redis si se detectan cuellos de botella.

## Verification Plan
1. **Docker Validation**: Simular contenedores caídos y verificar que el `pre-push` bloquee correctamente.
2. **UI Integration**: Generar un diagrama de secuencia en una misión y verificar que aparezca renderizado en el Dashboard.
3. **Trace Verification**: Confirmar que los spans de Jaeger se registren y sean accesibles desde el backend para alimentar la UI.
