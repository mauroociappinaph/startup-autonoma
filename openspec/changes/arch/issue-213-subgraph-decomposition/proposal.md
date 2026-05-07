# Proposal: Sub-Graph Orchestration - Decompose Monolithic Graph

## Intent

El grafo principal `backend/src/graph/index.ts` está empezando a acumular demasiada lógica de ruteo y dependencias cruzadas. Aunque existe una estructura de carpetas de dominios, la implementación actual tiene inconsistencias de nombrado y fugas de dominio (ej: Software Chief delegando directamente a Workers de otros dominios).

Esta propuesta busca:
1. Finalizar la fragmentación del grafo monolítico en sub-grafos aislados por dominio (Software, Business, Operations).
2. Corregir inconsistencias de nombrado entre los nodos Chief y sus Workers.
3. Reforzar la aislación de dominios para que los sub-grafos sean los únicos responsables de sus Workers internos.

## Scope

### In Scope
- Refactor de `backend/src/graph/index.ts` para que solo maneje orquestación de alto nivel (CEO, Sentinel, Circuit Breaker).
- Estandarización de nombres de nodos en los sub-grafos de `Software`, `Business` y `Operations`.
- Corrección de la lógica de delegación en los nodos Chief para que usen los nombres de nodos correctos dentro de sus sub-grafos.
- Asegurar que todos los sub-grafos retornen el control al `circuit_breaker` central.

### Out of Scope
- Implementación de estado de sub-grafo aislado (Input/Output mapping de LangGraph). Se mantendrá `AgentAnnotation` global por ahora.
- Creación de nuevos dominios.

## Capabilities

### Modified Capabilities
- orchestration-core: Refactorización del flujo de ruteo principal para delegación en sub-grafos.
- agent-delegation: Ajuste de las reglas de delegación de los Chiefs para respetar los límites de sus sub-grafos.

## Approach

Se utilizará el patrón de "Hierarchical Subgraphs" de LangGraph. El grafo raíz (`index.ts`) actuará como el "Mission Control" (Sentinel -> CEO -> Router), delegando la ejecución técnica a sub-grafos especializados que encapsulan a sus propios Workers.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `backend/src/graph/index.ts` | Modified | Simplificación del orquestador principal. |
| `backend/src/graph/domains/*/index.ts` | Modified | Estandarización de sub-grafos. |
| `backend/src/nodes/chiefs/*.ts` | Modified | Corrección de lógica de ruteo interno. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Pérdida de estado en la transición entre grafos | Low | Usar `AgentAnnotation` compartido para persistencia transparente. |
| Mismatched node names en el ruteo dinámico | High | Auditoría manual de los enums de decisión de los Chiefs. |

## Rollback Plan

Revertir los cambios en `backend/src/graph/` y los nodos Chief a la versión anterior de la rama `develop`.

## Success Criteria

- [ ] `backend/src/graph/index.ts` tiene menos de 150 líneas.
- [ ] No existen llamadas directas de un Chief a un Worker que no pertenezca a su sub-grafo.
- [ ] El flujo completo (Software, Business, Operations) es validado mediante un test de integración.
