# Spec: Fase C - Infraestructura y Visibilidad

## Requirements

### R1: Validación de Infraestructura (Docker-First)
- **R1.1**: El script `check-docker.js` DEBE verificar la conectividad TCP a Postgres (5432) y Redis (6379).
- **R1.2**: El hook `pre-push` DEBE fallar (exit 1) si algún servicio crítico (backend, ai-engine, redis, postgres) está en estado `unhealthy` o caído.

### R2: Visibilidad del Grafo (Live Traces)
- **R2.1**: El frontend DEBE tener una pestaña o sección "Execution Trace" que renderice diagramas Mermaid.
- **R2.2**: El frontend DEBE consumir el último diagrama generado por el `OperationsWorker`.
- **R2.3**: Cada nodo en el `OrchestrationGraph` DEBE cambiar de color o mostrar un badge si su latencia promedio supera los 500ms (datos de Jaeger/Telemetry).

### R3: Resiliencia de Operaciones
- **R3.1**: El `OperationsChief` DEBE poder solicitar un "Deep Health Audit" que el worker ejecute analizando logs de Docker.

## Scenarios

### S1: Pre-push bloqueado por Postgres caído
- **Given** que el contenedor `startup-db` está detenido.
- **When** intento hacer un `git push`.
- **Then** el hook `pre-push` debe reportar el error y detener el proceso de push.

### S2: Visualización de secuencia en Dashboard
- **Given** que el `OperationsChief` decidió generar un diagrama de secuencia.
- **When** el `OperationsWorker` guarda el archivo `.mmd` en `docs/`.
- **Then** el Dashboard debe detectar el cambio (vía API o SSE) y mostrar el diagrama renderizado al usuario.

### S3: Alerta de Latencia
- **Given** que el `ai_engine_worker` está tardando más de 1s por request.
- **When** se actualiza el estado del grafo en el dashboard.
- **Then** el nodo `ai_engine_worker` debe mostrar una alerta visual de "High Latency".
