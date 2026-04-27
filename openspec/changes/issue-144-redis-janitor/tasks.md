# Tasks: chore-144-redis-janitor

## Batch 1 — Infraestructura y Configuración

- [ ] **T1** `backend/src/db/redis.ts`
  - Implementar `enforceRedisLimits`.
  - Llamar a la función dentro de `getRedisConnection`.

- [ ] **T2** `backend/src/jobs/janitorWorker.ts` [NUEVO]
  - Crear la Queue `system-jobs`.
  - Implementar el Worker con la lógica de `SCAN` y limpieza por `IDLETIME`.
  - Configurar el job repeatable (cron 24h).

- [ ] **T3** `backend/src/jobs/index.ts`
  - Exportar el nuevo janitor worker.

## Batch 2 — Integración y Documentación

- [ ] **T4** `backend/src/index.ts`
  - Inicializar el janitor worker al arrancar el servidor.

- [ ] **T5** `README.md`
  - Agregar sección "Requisitos de Infraestructura: Redis".
  - Mencionar recomendaciones de maxmemory para despliegues fuera de Docker.

## Batch 3 — Verificación

- [ ] **T6** Script de prueba `backend/src/scripts/test-janitor.ts` [NUEVO]
  - Crear claves fake en Redis.
  - Forzar ejecución del Janitor.
  - Verificar limpieza.

- [ ] **T7** Ejecutar suite de tests completa para asegurar que BullMQ no tenga conflictos.
