# Tasks: Implement Operations Chief and Infrastructure Layer (#114)

## Phase 1: Foundation & Contracts
- [x] 1.1 Crear `packages/shared/src/contracts/operations_worker.ts` con el esquema Zod para el worker.
- [x] 1.2 Exportar el nuevo contrato en `packages/shared/src/contracts/index.ts`.
- [x] 1.3 Agregar `OperationsWorkerSchema` a los tipos globales en `backend/src/types/index.ts`.

## Phase 2: Operations Worker Implementation
- [x] 2.1 Crear `backend/src/nodes/workers/operations_worker.ts` con la lógica de ejecución de comandos.
- [x] 2.2 Implementar el helper `safeExec` con la lista blanca de comandos (docker_ps, docker_logs, etc).
- [x] 2.3 Registrar el nuevo worker en `backend/src/nodes/workers/index.ts`.

## Phase 3: Chief & Graph Integration
- [x] 3.1 Actualizar `backend/src/nodes/chiefs/operations_chief.ts` para delegar al `operations_worker`.
- [x] 3.2 Modificar `backend/src/nodes/ceo.ts` para incluir la lógica de ruteo al Operations Chief en el system prompt.
- [x] 3.3 Integrar `operations_worker` en `backend/src/graph/index.ts` y configurar las aristas condicionales.

## Phase 4: Verification & Testing
- [x] 4.1 Ejecutar `npm run test:autonomy -w backend` con una misión de monitoreo de Docker.
- [x] 4.2 Validar que las acciones de "restart" o "deploy" disparen la interrupción `__INTERRUPT__`.
- [x] 4.3 Verificar el streaming de razonamiento en el Dashboard para el nuevo Chief.
