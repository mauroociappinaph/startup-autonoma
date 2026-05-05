# Tasks: Centralized Environment (#199)

- [x] Crear rama `arch/issue-199-centralized-environment`
- [x] Generar artefactos SDD (proposal, spec)
- [x] Implementar `backend/src/config/env.ts` con validación fail-fast para variables críticas
- [x] Reemplazar los accesos directos de `REDIS_URL` en `redis.ts`
- [x] Conectar `index.ts` al nuevo módulo `env.ts` para PORT y AGENT_CONCURRENCY
- [x] Documentar todas las variables en `.env.example`
- [x] Verificación técnica (TypeScript) -> DONE
- [ ] Commit atómico
- [ ] Merge a develop + push + cierre de issue
