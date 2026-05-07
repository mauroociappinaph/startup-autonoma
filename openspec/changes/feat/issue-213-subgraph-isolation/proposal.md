# Change Proposal: Sub-Graph Domain Isolation (Issue #213)

## Intent
Transformar el grafo monolítico actual en una arquitectura de sub-grafos jerárquicos. Esto permitirá aislar la lógica de cada dominio (Software, Business, Operations), reducir la complejidad cognitiva del orquestador (CEO) y mejorar la escalabilidad del sistema.

## Scope
- **Backend (Graph)**: Creación de sub-grafos por dominio en `backend/src/graph/domains/`.
- **Backend (Nodes)**: Ajustar la delegación del CEO para invocar sub-grafos en lugar de nodos individuales.
- **Shared**: Asegurar que el estado (`AgentStateType`) sea compatible con la transferencia entre grafos.

## Proposed Approach
1. **Definición de Dominios**:
   - **Software Domain**: Incluye `software_chief` y sus workers (`git`, `test`, `code_researcher`, `code_writer`, `review`).
   - **Business Domain**: Incluye `business_chief` y sus workers (`ai_engine`, `researcher`, `persistence`).
   - **Operations Domain**: Incluye `operations_chief` y sus workers (`operations_worker`, `security_worker`).
2. **Implementación de Sub-grafos**: Cada dominio tendrá su propio archivo `graph.ts` que compila un sub-grafo local.
3. **Orquestación Hierárquica**: El grafo principal (en `backend/src/graph/index.ts`) registrará estos sub-grafos como nodos.
4. **Estado**: Mantener `AgentAnnotation` compartido para evitar pérdida de contexto al entrar/salir de sub-grafos.

## Risks
- **Perdida de Estado**: Errores en el mapeo de estado entre el grafo padre y los hijos.
- **Ciclos Infinitos**: Recursión entre el CEO y los sub-grafos si las condiciones de salida no son claras.
- **Persistencia**: Asegurar que el `checkpointer` funcione correctamente en grafos anidados.

## User Review Required
> [!IMPORTANT]
> Esta es una de las refactorizaciones arquitectónicas más profundas. Cambia la forma en que los agentes se comunican. Los sub-grafos permiten que los Chiefs tengan su propia lógica de control interna sin molestar al CEO.
