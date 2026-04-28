# Tasks: feat(healthchecks-145)

## Fase 1: Contratos y AI-Engine
- [ ] **T1** Actualizar `protos/ai_engine.proto` con el método `Ping`.
- [ ] **T2** Regenerar tipos de protos (`npm run build:protos` o similar).
- [ ] **T3** Implementar `Ping` en `ai-engine/app/core/grpc_server.py`.
- [ ] **T4** Actualizar `ai-engine/Dockerfile` para usar `app/main.py`.

## Fase 2: Backend Integration
- [ ] **T5** Implementar `ping()` en `backend/src/services/aiEngineClient.ts`.
- [ ] **T6** Refactorizar `backend/src/controllers/systemController.ts` para realizar validaciones reales.
- [ ] **T7** Crear test unitario `backend/src/tests/health.test.ts`.

## Fase 3: Docker & Orquestación
- [ ] **T8** Refinar `docker-compose.yml` healthchecks.
- [ ] **T9** Verificar orquestación con `docker compose up`.
