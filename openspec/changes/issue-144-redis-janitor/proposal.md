# Proposal: chore(redis): Configurar maxmemory y janitor de checkpoints (#144)

## Intent
Optimizar el uso de memoria de Redis y prevenir el crecimiento desmedido de datos obsoletos. Actualmente, el Redis local no tiene límites de memoria (`maxmemory: 0B`) y los checkpoints de LangGraph se acumulan indefinidamente sin TTL.

## Scope
- **Enforcement de maxmemory**: Script/Config para asegurar que Redis local use un límite (256mb) y política de desalojo (allkeys-lru).
- **Janitor Job**: Implementar un job recurrente con BullMQ para limpiar checkpoints huérfanos de más de 7 días.
- **TTL en writes**: Asegurar que las claves temporales de `writes:*` tengan un TTL corto (24h).
- **Documentación**: Actualizar README.md con los requisitos de infraestructura.

## Approach
1. **Janitor Job**: Crearemos `janitorWorker.ts` que se ejecute cada 24h usando BullMQ Repeatable Jobs. Usará `SCAN` para encontrar claves `checkpoint:*` y borrará aquellas cuya última actividad sea antigua.
2. **Local Redis Config**: Agregaremos un paso en el arranque del servidor (o un script de utilidad) que ejecute `CONFIG SET maxmemory 256mb` y `CONFIG SET maxmemory-policy allkeys-lru` para asegurar que incluso instalaciones locales "raw" estén protegidas.
3. **TTL en writes**: Dado que `writes:*` son estados intermedios de LangGraph, les pondremos un TTL de 24h al crearse (si es posible inyectarlo en el checkpointer) o el Janitor los limpiará también.

## Affected Components
- `backend/src/db/redis.ts`: Agregar lógica de configuración inicial.
- `backend/src/jobs/janitorWorker.ts`: Nuevo worker para limpieza.
- `backend/src/index.ts`: Inicializar el Janitor.
- `README.md`: Documentar requisitos.
