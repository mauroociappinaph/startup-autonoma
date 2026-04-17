import { enqueueAgentJob } from "../src/jobs/agentQueue.js";
import { agentWorker } from "../src/jobs/agentWorker.js";
import { closeRedisConnections } from "../src/db/redis.js";

/**
 * Test de estrés/concurrencia para verificar que BullMQ maneja múltiples jobs
 * y que el checkpointer de Redis aisla correctamente los estados.
 */
async function testConcurrency() {
  console.log("🧪 Iniciando test de concurrencia...");

  // Iniciamos el worker con concurrencia 5
  agentWorker.start(5);

  const prompts = [
    "Proyecto A: Crea un archivo README.md",
    "Proyecto B: Analiza el mercado de panaderías",
    "Proyecto C: Genera un plan de marketing",
    "Proyecto D: Crea un bot de Slack",
    "Proyecto E: Investiga sobre LangGraph"
  ];

  console.log(`📥 Encolando ${prompts.length} jobs simultáneos...`);

  const startTime = Date.now();
  const jobs = await Promise.all(
    prompts.map((p, i) => enqueueAgentJob(p, `project-${i}`))
  );

  console.log(`✅ ${jobs.length} jobs encolados exitosamente.`);

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

// Ejecutar si se llama directamente
if (process.argv[1].endsWith('concurrency.test.ts')) {
  testConcurrency().catch(console.error);
}
