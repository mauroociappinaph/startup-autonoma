# Tasks: Monitoreo de Presupuesto en USD (Issue #35)

## Phase 1: Foundation (Shared Types)
- [x] 1.1 [MODIFY] `packages/shared/src/types/Project.types.ts`: Agregar `maxUsdBudget` al schema Zod con valor por defecto de 10.0.

## Phase 2: Testing Infrastructure (TDD Red)
- [x] 2.1 [NEW] `backend/src/tests/budget_usd.test.ts`: Crear test unitario para `BudgetService` que valide el fallo por USD y la emisión de alertas.

## Phase 3: Core Implementation (TDD Green)
- [x] 3.1 [MODIFY] `backend/src/services/BudgetService.ts`: Implementar validación de USD en `checkSecurityStatus` consultando a `TelemetryService`.
- [x] 3.2 [MODIFY] `backend/src/nodes/circuit_breaker.ts`: Integrar la validación y actualizar el reporte de error para mencionar USD.

## Phase 4: Verification & Refactor
- [x] 4.1 Ejecutar `npm run test` y validar que el nuevo test pase.
- [x] 4.2 Refactorizar para cumplir con estándares de la arquitectura (Leyes Sagradas).

## Phase 5: Persistence & API
- [x] 5.1 [MODIFY] `backend/src/services/projectService.ts`: Implementar persistencia de `ProjectContext` en Redis.
- [x] 5.2 [NEW] `backend/src/routes/projectRoutes.ts`: Crear endpoint `PATCH /projects/:id/budget` para actualizar el límite.
- [x] 5.3 [MODIFY] `backend/src/index.ts`: Registrar las nuevas rutas de proyecto.

## Phase 6: Frontend Integration
- [x] 6.1 [MODIFY] `frontend/src/store/useAgentStore.ts`: Agregar `maxUsdBudget` al estado y acción para actualizarlo.
- [x] 6.2 [NEW] `frontend/src/components/dashboard/BudgetControl.tsx`: Crear componente con barra de progreso y selector de límite.
- [x] 6.3 [MODIFY] `frontend/src/app/dashboard/page.tsx`: Integrar el `BudgetControl` en el layout.
