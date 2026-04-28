# Tasks: Operations Chief & Sequence Diagramming (#114)

- [x] **Phase 1: Contracts & Types**
    - [x] Modificar `OperationsChiefSchema` en `packages/shared/src/contracts/operations_chief.ts`.
    - [x] Exportar nuevos tipos si es necesario.

- [x] **Phase 2: Diagram Logic (TDD)**
    - [x] Crear `backend/src/tests/diagram_helper.test.ts` con casos de prueba para Mermaid.
    - [x] Implementar `backend/src/helpers/diagramHelper.ts` hasta que pasen los tests.

- [x] **Phase 3: Operations Chief Node**
    - [x] Actualizar el prompt del jefe de operaciones en `backend/src/nodes/chiefs/operations_chief.ts`.
    - [x] Incluir instrucciones sobre el rol de "Arquitecto de Observabilidad".

- [x] **Phase 4: Operations Worker Node**
    - [x] Implementar el handler para `generate_sequence_diagram` en `backend/src/nodes/workers/operations_worker_node.ts`.
    - [x] Asegurar la creación de directorios y escritura de archivos `.mmd`.

- [x] **Phase 5: Verification & Documentation**
    - [x] Ejecutar flujo completo y verificar generación automática de diagrama.
    - [x] Actualizar `AGENTS.md` para marcar el Operations Chief como ✅.
