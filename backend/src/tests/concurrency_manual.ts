import { enqueueAgentJob } from "@/jobs/agentQueue.js";
import { agentWorker } from "@/jobs/agentWorker.js";
import { closeRedisConnections } from "@/db/redis.js";

/**
 * Test de estrés/concurrencia para verificar que BullMQ maneja múltiples jobs
 * sin corromper el estado o perder trazas.
 */
async function testConcurrency() {
  const startTime = Date.now();
  const NUM_JOBS = 5;
  const PROJECT_ID = "stress-test-" + startTime;

  console.log(`🚀 Iniciando test de concurrencia con ${NUM_JOBS} jobs...`);

  const jobs = [];
  for (let i = 0; i < NUM_JOBS; i++) {
    jobs.push(
      enqueueAgentJob(
        `Tarea concurrente #${i}`,
        PROJECT_ID
      )
    );
  }

  await Promise.all(jobs);
  console.log("✅ Jobs encolados. Arrancando worker...");

  // Iniciamos el worker en este mismo proceso para el test manual
  agentWorker.start();

  // Esperamos un tiempo razonable para que los workers procesen
  // (En un test real usaríamos eventos de BullMQ para saber exactamente cuándo terminan)
  console.log("⏳ Esperando procesamiento (30s)...");
  
  return new Promise((resolve) => {
    setTimeout(async () => {
      const duration = (Date.now() - startTime) / 1000;
      console.log(`🏁 Test finalizado tras ${duration}s`);
      
      await agentWorker.stop();
      await closeRedisConnections();
      resolve(true);
    }, 30000);
  });
}

testConcurrency().catch(console.error);
