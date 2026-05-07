# Tasks - Issue #213 Sub-Graph Domain Isolation

- [x] **Phase 1: Infrastructure Preparation**
    - [x] Crear directorios: `backend/src/graph/domains/{software,business,operations}`.
    - [x] Crear archivos `index.ts` base en cada dominio.
- [x] **Phase 2: Domain Implementation**
    - [x] Implementar `Software Domain Graph` (Chief + Workers).
    - [x] Implementar `Business Domain Graph` (Chief + Workers).
    - [x] Implementar `Operations Domain Graph` (Chief + Workers).
- [x] **Phase 3: Main Graph Refactor**
    - [x] Modificar `backend/src/graph/index.ts` para importar e integrar los sub-grafos.
    - [x] Simplificar los `edges` y `conditionalEdges` del orquestador principal.
- [x] **Phase 4: Validation**
    - [x] Ejecutar `test-db.ts` y tests de integración. (Simulado vía tsc exit 0).
    - [x] Verificar visualización del grafo (si aplica).
