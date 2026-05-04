# Tasks: Fase C - Infraestructura y Visibilidad

## Phase 1: Robustez de Infraestructura (Docker)
- [ ] **1.1. Refactor `check-docker.js`**:
    - [ ] Implementar validación de puertos vía `net.connect` (Postgres, Redis).
    - [ ] Mejorar el parseo de `docker compose ps` para manejar diferentes versiones de salida JSON.
    - [ ] Añadir flag `--strict` que devuelva `exit 1` ante cualquier fallo.
- [ ] **1.2. Update Husky Hooks**:
    - [ ] Activar modo bloqueante (`--strict`) en `.husky/pre-push`.

## Phase 2: Visibilidad (Backend & Observability)
- [ ] **2.1. Telemetry API**:
    - [ ] Exponer métricas de latencia por nodo en un nuevo endpoint `/api/infra/telemetry`.
    - [ ] Integrar el `TelemetryService` con el agregador de métricas del estado.
- [ ] **2.2. Operations Worker Enhancements**:
    - [ ] Asegurar que el contenido de los diagramas Mermaid se guarde también en el estado del grafo (`state.messages` o un campo específico `state.last_diagram`).

## Phase 3: Dashboard (Frontend)
- [ ] **3.1. Live Sequence Diagram Component**:
    - [ ] Instalar `mermaid` y crear el componente `LiveSequenceDiagram`.
    - [ ] Integrarlo en una nueva pestaña del Dashboard.
- [ ] **3.2. Graph Latency Overlays**:
    - [ ] Actualizar `OrchestrationGraph` para renderizar el estado de salud de cada nodo basado en la telemetría.

## Phase 4: Validación y Cierre
- [ ] **4.1. E2E Validation**:
    - [ ] Probar flujo completo: misión -> generación de diagrama -> visualización UI.
    - [ ] Probar bloqueo de push con Redis caído.
- [ ] **4.2. Update Documentation**:
    - [ ] Marcar Dockerization como ✅ en `AGENTS.md`.
    - [ ] Marcar Graph Visibility como ✅ en `AGENTS.md`.
