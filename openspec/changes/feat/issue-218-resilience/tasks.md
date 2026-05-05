# Implementation Tasks: Process Resilience (Issue #218)

- [x] **Prisma Singleton**
    - [x] Refactorizar `packages/db/src/index.ts` con el patrón global singleton.
    - [x] Validar tipado estricto (No Any) en el objeto global.
- [x] **AI Engine Graceful Shutdown**
    - [x] Importar el módulo `signal` en `ai-engine/app/main.py` (Manejado via lifespan de FastAPI).
    - [x] Registrar handlers para `SIGINT` y `SIGTERM` (Manejado via lifespan y CancelledError).
    - [x] Implementar el método de stop del servidor gRPC con timeout de 10s.
- [x] **Verification**
    - [x] Ejecutar `test-db.ts` para asegurar integridad de Prisma.
    - [x] Simular señales en el entorno de desarrollo de Python.
