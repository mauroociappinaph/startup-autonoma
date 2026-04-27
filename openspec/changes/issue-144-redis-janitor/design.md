# Design: chore-144-redis-janitor

## Architecture Decision

### Redis Configuration Enforcement
En lugar de depender exclusivamente de archivos `.conf` externos, el backend ejecutará `CONFIG SET` al arrancar.
- **Pros**: Funciona en entornos donde el usuario solo instaló Redis vía brew/apt sin configurar nada.
- **Cons**: Requiere que Redis no esté protegido contra `CONFIG` (común en dev).

### Janitor Implementation
Usaremos un `Worker` dedicado en BullMQ para no bloquear la cola de ejecución de agentes.
- **Queue Name**: `system-jobs`
- **Job Name**: `redis-janitor`
- **Cron**: `0 0 * * *` (Medianoche cada día)

---

## Component Design

### 1. `backend/src/db/redis.ts` — Enforcement
Agregaremos una función `enforceRedisLimits(redis: Redis)` que se llame una única vez al conectar.

```typescript
async function enforceRedisLimits(redis: Redis) {
  try {
    await redis.config("SET", "maxmemory", "256mb");
    await redis.config("SET", "maxmemory-policy", "allkeys-lru");
    SacredLogger.info("✅ Redis: límites de memoria configurados (256mb, allkeys-lru)", "INFRA");
  } catch (e) {
    SacredLogger.warning("⚠️ Redis: no se pudo configurar maxmemory automáticamente. Asegúrate de configurarlo manualmente.", "INFRA");
  }
}
```

### 2. `backend/src/jobs/janitorWorker.ts` — Janitor logic
Usará `SCAN` para evitar bloquear Redis (O(N) vs O(1) de `KEYS`).

```typescript
// Pseudo-code logic
async function runJanitor() {
  let cursor = "0";
  const retentionMs = 7 * 24 * 60 * 60 * 1000; // 7 días
  const now = Date.now();
  
  do {
    const [nextCursor, keys] = await redis.scan(cursor, "MATCH", "checkpoint:*", "COUNT", 100);
    cursor = nextCursor;
    
    for (const key of keys) {
       // Check idle time
       const idle = await redis.object("IDLETIME", key);
       if (idle > retentionMs / 1000) {
         await redis.del(key);
       }
    }
  } while (cursor !== "0");
}
```

---

## Test Strategy
1. **Unit Test**: Mockear Redis y verificar que el Janitor identifique correctamente las claves obsoletas.
2. **Integration Test**: Ejecutar el Janitor contra un Redis real (containerizado) con claves "viejas" (manipulando `IDLETIME` o el contenido).
