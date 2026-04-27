import { Queue, Worker, Job } from "bullmq";
import { getRedisConnection } from "@/db/redis.js";
import { SacredLogger } from "@/helpers/logger.js";

/** Nombre de la cola de sistemas */
export const SYSTEM_QUEUE_NAME = "system-jobs";
export const REDIS_JANITOR_JOB_NAME = "redis-janitor";

let systemQueue: Queue | null = null;

/**
 * Retorna la instancia de la Queue de sistemas.
 */
export const getSystemQueue = (): Queue => {
  if (!systemQueue) {
    systemQueue = new Queue(SYSTEM_QUEUE_NAME, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
      },
    });
  }
  return systemQueue;
};

/**
 * Lógica del recolector de residuos de Redis.
 * Escanea y elimina claves obsoletas de LangGraph.
 */
async function performRedisCleanup() {
  const redis = getRedisConnection();
  const RETENTION_CHECKPOINTS_MS = 7 * 24 * 60 * 60 * 1000; // 7 días
  const RETENTION_WRITES_MS = 24 * 60 * 60 * 1000; // 24 horas

  let cursor = "0";
  let totalScanned = 0;
  let totalDeleted = 0;

  SacredLogger.info("🧹 Iniciando Janitor de Redis...", "JANITOR");

  do {
    // Escaneamos tanto checkpoints como writes
    const [nextCursor, keys] = await redis.scan(cursor, "MATCH", "*", "COUNT", 100);
    cursor = nextCursor;

    for (const key of keys) {
      if (!key.startsWith("checkpoint:") && !key.startsWith("writes:")) continue;
      
      totalScanned++;
      const idleTimeSeconds = await redis.object("IDLETIME", key);
      
      if (idleTimeSeconds === null) continue;

      const idleTimeMs = (idleTimeSeconds as number) * 1000;
      const limit = key.startsWith("checkpoint:") ? RETENTION_CHECKPOINTS_MS : RETENTION_WRITES_MS;

      if (idleTimeMs > limit) {
        await redis.del(key);
        totalDeleted++;
      }
    }
  } while (cursor !== "0");

  SacredLogger.success(`🧹 Janitor completado. Scanned: ${totalScanned} | Deleted: ${totalDeleted}`, "JANITOR");
  
  return { totalScanned, totalDeleted };
}

/**
 * Worker para procesar jobs de sistema.
 */
export const systemWorker = new Worker(
  SYSTEM_QUEUE_NAME,
  async (job: Job) => {
    if (job.name === REDIS_JANITOR_JOB_NAME) {
      return await performRedisCleanup();
    }
  },
  {
    connection: getRedisConnection(),
    concurrency: 1,
  }
);

/**
 * Configura el Janitor para que se ejecute cada 24 horas.
 */
export const setupRedisJanitor = async () => {
  const queue = getSystemQueue();
  
  // Agregamos el job repetible (cada medianoche)
  await queue.add(
    REDIS_JANITOR_JOB_NAME,
    {},
    {
      repeat: {
        pattern: "0 0 * * *", // Cron: medianoche
      },
      jobId: REDIS_JANITOR_JOB_NAME, // ID constante para evitar duplicados
    }
  );

  SacredLogger.info("🕒 Janitor de Redis programado (00:00 cada día)", "INFRA");
};

// Manejo de eventos del worker
systemWorker.on("completed", (job) => {
  if (job?.name === REDIS_JANITOR_JOB_NAME) {
    SacredLogger.info(`✅ Janitor Job ${job.id} completado con éxito.`, "JANITOR");
  }
});

systemWorker.on("failed", (job, err) => {
  SacredLogger.error(`❌ Janitor Job ${job?.id} falló: ${err.message}`, "JANITOR");
});
