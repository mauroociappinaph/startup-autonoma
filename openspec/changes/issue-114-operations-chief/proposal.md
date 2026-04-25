# Proposal: Implement Operations Chief and Infrastructure Layer (#114)

## Intent

Habilitar la **Fase C** de la Startup Autónoma, permitiendo que el sistema gestione su propia infraestructura, monitoree su salud y ejecute despliegues o rollbacks de forma autónoma. Actualmente, el sistema es ciego a su entorno de ejecución (Docker) y no tiene un agente responsable de la estabilidad operativa.

## Scope

### In Scope
- Implementar el `OperationsChief` con lógica de decisión para infraestructura.
- Crear el `OperationsWorker` en el backend para ejecutar tareas de monitoreo y Docker.
- Actualizar el nodo `CEO` para delegar misiones de infraestructura al `OperationsChief`.
- Integrar el nuevo flujo en el `StateGraph` principal.
- Definir un "Safe Toolset" para comandos de Docker.

### Out of Scope
- Auto-scaling real en la nube (AWS/GCP). Se limitará a gestión de contenedores locales.
- Migraciones de bases de datos automáticas (fuera de scope inicial).
- Gestión de secretos (se asume que las env están configuradas).

## Capabilities

### New Capabilities
- `operations-chief`: Gestión estratégica de infraestructura, despliegues y salud del sistema.
- `infrastructure-monitoring`: Capacidad de auditar logs y estados de contenedores Docker en tiempo real.

### Modified Capabilities
- `core`: El orquestador CEO ahora debe reconocer y delegar intenciones relacionadas con Ops.

## Approach

Se utilizará una arquitectura híbrida donde el `OperationsChief` (Smart Model) toma decisiones estratégicas basadas en el estado del sistema, y delega en un `OperationsWorker` (Fast Model) que interactúa con el host a través de comandos pre-validados.

1.  **Orquestación**: El CEO detectará keywords como "status", "docker", "logs", "deploy" para delegar al Ops Chief.
2.  **Ejecución**: El `OperationsWorker` usará `exec` de Node.js con una lista blanca de comandos para evitar vulnerabilidades de inyección.
3.  **Seguridad**: Toda acción destructiva (restart, rollback) requerirá aprobación humana (HITL) por defecto.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `backend/src/nodes/chiefs/operations_chief.ts` | Modified | Implementar lógica real y ruteo a workers. |
| `backend/src/nodes/ceo.ts` | Modified | Agregar lógica de ruteo al Operations Chief. |
| `backend/src/nodes/workers/operations_worker.ts` | New | Worker para ejecución de comandos de infra. |
| `backend/src/graph/index.ts` | Modified | Configurar aristas del CEO hacia el Operations Chief. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Shell Injection | Medium | Lista blanca estricta de comandos y sanitización de argumentos. |
| Resource Exhaustion | Low | Monitorización de logs para evitar loops infinitos de infra. |
| System Instability | Medium | HITL obligatorio para acciones críticas. |

## Rollback Plan

Si el Operations Chief causa inestabilidad:
1. Eliminar las aristas del CEO en `backend/src/graph/index.ts`.
2. El sistema volverá a ignorar misiones de infraestructura.

## Dependencies

- **Docker Compose**: El sistema debe estar corriendo en un entorno compatible con Docker para que el worker sea útil.

## Success Criteria

- [ ] El CEO delega misiones de "status" al Operations Chief.
- [ ] El Operations Chief reporta el estado de los contenedores Docker usando el OperationsWorker.
- [ ] El Dashboard muestra el razonamiento del Ops Chief correctamente.
- [ ] Las acciones críticas disparan una interrupción de seguridad.
