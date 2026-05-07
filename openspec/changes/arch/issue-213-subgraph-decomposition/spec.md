# Spec Delta: Sub-Graph Orchestration

## Context
Esta especificación modifica el comportamiento de ruteo interno del sistema para transicionar de un grafo plano a una jerarquía de sub-grafos.

## Requirements

### R1: Aislamiento de Ruteo
- El grafo principal (`index.ts`) **NO** debe contener aristas hacia nodos de tipo Worker (ej: `git_worker`, `researcher`).
- El ruteo hacia Workers debe ocurrir exclusivamente dentro de sus respectivos sub-grafos de dominio.

### R2: Contrato de Retorno
- Todos los sub-grafos de dominio deben terminar en un nodo que devuelva el control al `circuit_breaker` del grafo principal.
- Si un Chief decide terminar la misión (`complete`), debe limpiar el campo `active_chief` y devolver el control al `ceo` para la validación final.

### R3: Estandarización de Nombres
- Los nombres de los nodos en los sub-grafos deben coincidir exactamente con los enums de decisión de los Chiefs.
  - `software_domain`: `git_worker`, `test_runner`, `code_researcher`, `code_writer`, `review_worker`.
  - `business_domain`: `researcher`, `ai_engine_worker`, `persistence_worker`.
  - `operations_domain`: `operations_worker`, `security_worker`.

## Scenarios

### Escenario 1: Delegación de Software
**Dado** que el CEO ha delegado en el `software_chief`.
**Cuando** el `software_chief` decide realizar una operación de Git.
**Entonces** el grafo principal debe rutear al nodo `software_domain`.
**Y** el sub-grafo de software debe ejecutar el `git_worker`.
**Y** al terminar, el control debe volver al `software_chief` dentro de su sub-grafo.

### Escenario 2: Finalización de Misión de Dominio
**Dado** que un Chief ha completado su tarea asignada.
**Cuando** el Chief devuelve la decisión `complete`.
**Entonces** el sub-grafo debe terminar (`END`).
**Y** el grafo principal debe recibir el control en el `circuit_breaker`, detectar que no hay `active_chief` y rutear al `ceo`.
