# Proposal: Managed PostgreSQL Persistence (Supabase + Prisma)

Implement a persistent relational data layer using Supabase (managed PostgreSQL) and Prisma (ORM).

## Context
The user prefers not to install PostgreSQL locally. Supabase provides a managed alternative that fits perfectly with our cloud-native agent architecture.

## Strategy
1. **Package Centralization:** Create `packages/db` to export a shared Prisma client.
2. **Schema Definition:** Initial models for `Project` (isolation) and `AuditLog` (traceability).
3. **Hybrid Storage:** 
   - PostgreSQL: Source of truth for configuration and long-term logs.
   - Redis: Real-time metrics, locks, and task queues (BullMQ).

## User Review Required
- Need Supabase `DATABASE_URL` and `DIRECT_URL`.
- Decision on `packages/db` monorepo structure.
