# Tasks: Sentry Integration (Issue #186)

- [x] T1: Crear rama `feat/issue-186-sentry-integration`
- [x] T2: Crear SDD-FF (Proposal, Spec, Design, Tasks)
- [ ] T3: Actualizar Issue en GitHub (Sync)
- [x] T4: Actualizar `.env.example` y `env.ts` con variables `SENTRY_DSN_*`
- [x] T5: Backend (Node.js)
  - [x] Instalar `@sentry/node` y `@sentry/profiling-node`
  - [x] Inicializar en `index.ts`
  - [x] Conectar logger de `SacredLogger` para emitir breadcrumbs
- [x] T6: AI Engine (Python)
  - [x] Instalar `sentry-sdk[fastapi]`
  - [x] Inicializar en `main.py`
- [x] T7: Frontend (Next.js)
  - [x] Ejecutar el comando del wizard para inicializar Sentry en Next.js (Manual)
- [x] T8: Pruebas unitarias/verificación SDD (`/sdd-verify`)
- [x] T9: Commit, Push y Merge a develop
