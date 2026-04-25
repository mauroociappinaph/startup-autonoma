# Delta for Core

## ADDED Requirements

### Requirement: CEO Delegation to Operations Chief
El CEO MUST detectar intenciones de infraestructura y delegar al `operations_chief`.

#### Scenario: Detección de intención de Ops
- GIVEN un usuario preguntando "¿Cómo están los contenedores?"
- WHEN el CEO analiza el pedido
- THEN el CEO MUST incluir `operations_chief` en su plan de ejecución.
