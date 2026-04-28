# Specification: Operations Chief & Sequence Diagramming (#114)

## Domain: observability/graph-visibility

### Requirement: Automatic Sequence Diagramming
El sistema DEBE ser capaz de generar un archivo Mermaid que represente la interacción entre los agentes involucrados en la sesión actual.

#### Scenario: Generación de diagrama tras delegación múltiple
- **GIVEN** una sesión donde el CEO delegó al SoftwareChief, y este al GitWorker.
- **WHEN** el OperationsChief recibe la acción `generate_sequence_diagram`.
- **THEN** el OperationsWorker DEBE crear un archivo `.mmd` en `docs/architecture/sequences/`.
- **AND** el contenido DEBE seguir la sintaxis de Mermaid `sequenceDiagram`.
- **AND** los actores DEBEN ser los nombres de los nodos (CEO, Software Chief, Git Worker).

### Requirement: Infrastructure Operations
El sistema DEBE permitir la ejecución segura de comandos de mantenimiento.

#### Scenario: Auditoría de logs
- **GIVEN** una solicitud para revisar logs de errores.
- **WHEN** el OperationsChief decide ejecutar `audit_logs`.
- **THEN** el OperationsWorker DEBE retornar las últimas líneas de los logs del sistema (SacredLogger).

## Domain: architecture/hierarchy

### Requirement: Chief Independence
El OperationsChief DEBE rechazar tareas que no pertenezcan a su dominio (infraestructura/observabilidad).

#### Scenario: Rechazo de edición de código
- **GIVEN** una instrucción para corregir un bug en un archivo `.ts`.
- **WHEN** el OperationsChief procesa la solicitud.
- **THEN** DEBE responder con `requires_approval: true`.
- **AND** DEBE indicar en el reasoning que la tarea pertenece al Software Chief.
