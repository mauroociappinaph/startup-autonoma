# Operations Chief Specification

## Purpose

Define el comportamiento esperado del Operations Chief para la gestión de infraestructura y salud operativa de la Startup Autónoma.

## Requirements

### Requirement: Delegation to Operations Chief
El sistema MUST delegar misiones relacionadas con infraestructura, Docker, salud del sistema y despliegues al Operations Chief.

#### Scenario: Solicitud de estado de contenedores
- GIVEN un input de usuario pidiendo "ver el estado de docker"
- WHEN el CEO procesa el input
- THEN el CEO MUST delegar la tarea al Operations Chief.

### Requirement: Infrastructure Monitoring
El Operations Chief SHALL ser capaz de reportar el estado de salud de los servicios definidos en el ecosistema.

#### Scenario: Auditoría de logs de un servicio
- GIVEN una misión de "revisar los logs del backend"
- WHEN el Operations Chief procesa la misión
- THEN el Operations Chief MUST delegar en el OperationsWorker para obtener los logs
- AND el reporte final MUST incluir extractos relevantes de los logs.

### Requirement: Safety Gate for Destructive Actions
Toda acción que modifique el estado de la infraestructura (restart, rollback, deploy) MUST requerir aprobación humana explicita (HITL).

#### Scenario: Intento de rollback de contenedor
- GIVEN una decisión de "rollback" del Operations Chief
- WHEN el estado se actualiza
- THEN el campo `requires_approval` MUST ser `true`
- AND el sistema MUST interrumpir la ejecución esperando el input del Mirror/Usuario.
