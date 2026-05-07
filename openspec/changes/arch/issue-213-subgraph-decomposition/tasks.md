# Task List: Sub-Graph Orchestration

- [ ] **Phase 1: Cleanup & Standardization**
    - [ ] 1.1. Refactor `backend/src/nodes/chiefs/software_chief.ts`: corregir ruteo hacia `code_researcher` (no `researcher`) y eliminar delegación directa a `ai_engine_worker`.
    - [ ] 1.2. Refactor `backend/src/nodes/chiefs/business_chief.ts`: asegurar que maneja correctamente sus workers internos.
    - [ ] 1.3. Refactor `backend/src/nodes/chiefs/operations_chief.ts`: verificar consistencia con su sub-grafo.
- [ ] **Phase 2: Graph Wiring**
    - [ ] 2.1. Validar `backend/src/graph/index.ts`: asegurar que las aristas condicionales del `circuit_breaker` cubren todos los dominios.
    - [ ] 2.2. Validar retornos de sub-grafos: asegurar que todos vuelven al `circuit_breaker`.
- [ ] **Phase 3: Validation**
    - [ ] 3.1. Crear un test de integración `backend/src/tests/graph/subgraph_orchestration.test.ts`.
    - [ ] 3.2. Ejecutar auditoría de leyes (`npm run lint`).
- [ ] **Phase 4: Documentation**
    - [ ] 4.1. Actualizar `AGENTS.md` con la nueva jerarquía de sub-grafos.
    - [ ] 4.2. Marcar ACs como completadas en GitHub Issue #213.
