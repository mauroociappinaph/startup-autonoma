# Tasks: Supabase + Prisma Integration (#108)

## Phase 1: Infrastructure & Package Setup
- [x] 1.1 [NEW] `packages/db/package.json`: Definir el nuevo paquete.
- [x] 1.2 [NEW] `packages/db/prisma/schema.prisma`: Definir schema inicial.
- [x] 1.3 [NEW] `packages/db/src/index.ts`: Implementar singleton del cliente.
- [x] 1.4 [MODIFY] Root `package.json` & `turbo.json`: Registrar el nuevo workspace.

## Phase 2: Schema Definition
- [x] 2.1 Definir modelo `Project`.
- [x] 2.2 Definir modelo `AuditLog` (con soporte para metadata JSON).

## Phase 3: Backend Integration
- [x] 3.1 [MODIFY] `backend/src/services/projectService.ts`: Integrar Prisma para CRUD de proyectos.
- [x] 3.2 [NEW] `backend/src/services/auditService.ts`: Implementar logger persistente.

## Phase 4: Verification
- [ ] 4.1 Validar migraciones en Supabase.
- [ ] 4.2 Ejecutar tests de integración.
