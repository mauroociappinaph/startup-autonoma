import { Worker, Job } from "bullmq";
import { getRedisConnection } from "@/db/redis.js";
import { AgentJobData, AgentJobResult } from "@/types/agent-job.types.js";
import { GraphService } from "@/services/graphService.js";
import { AGENT_QUEUE_NAME } from "@/jobs/agentQueue.js";

/**
 * Worker de BullMQ que consume la cola de agentes.
 * 
 * Responsabilidad única (SRP): tomar un job de la cola y ejecutar el grafo.
 * El resultado del streaming se emite via EventBus para que el SSE lo consuma.
 * 
 * Razón del diseño: desacoplar trigger (API REST) de ejecución (LangGraph),
 * habilitando concurrencia real sin colisiones de estado.
 */
export class AgentWorker {
  private worker: Worker<AgentJobData, AgentJobResult> | null = null;

  /**
   * Inicia el worker. Solo llamar una vez al inicio del proceso.
   * @param concurrency Número de jobs simultáneos. Default: 2.
   */
  start(concurrency = 2): void {
    if (this.worker) {
      console.warn("⚠️  AgentWorker ya está corriendo. Ignorando llamada duplicada.");
      return;
    }

    this.worker = new Worker<AgentJobData, AgentJobResult>(
      AGENT_QUEUE_NAME,
      this.processJob.bind(this),
      {
        connection: getRedisConnection(),
        concurrency,
      },
    );

    this.worker.on("completed", (job) => {
      console.log(`✅ Job completado: ${job.id} | session: ${job.data.sessionId}`);
    });

    this.worker.on("failed", (job, err) => {
      console.error(`❌ Job fallido: ${job?.id} | error: ${err.message}`);
    });

    this.worker.on("active", (job) => {
      console.log(`🔄 Job activo: ${job.id} | session: ${job.data.sessionId}`);
    });

    console.log(`🚀 AgentWorker iniciado (concurrency: ${concurrency})`);
  }

  /**
   * Detiene el worker de forma segura, esperando que los jobs activos terminen.
   */
  async stop(): Promise<void> {
    await this.worker?.close();
    this.worker = null;
    console.log("🛑 AgentWorker detenido");
  }

  /**
   * Procesa un job individual.
   * Consume el stream del grafo y emite eventos al EventBus para el SSE.
   */
  private async processJob(job: Job<AgentJobData, AgentJobResult>): Promise<AgentJobResult> {
    const { prompt, sessionId } = job.data;

    console.log(`🧠 Procesando job ${job.id} | prompt: "${prompt.substring(0, 60)}..."`);

    try {
      // Consumimos el stream del grafo. Los eventos son emitidos al EventBus
      // para que el SSE endpoint los entregue al cliente en tiempo real.
      const stream = GraphService.runAgentStream(prompt, sessionId);

      for await (const _event of stream) {
        // El EventBus emitirá los eventos internamente dentro de GraphService.
        // Aquí solo avanzamos el generador para que fluya.
        await job.updateProgress(1);
      }

      return {
        sessionId,
        completedAt: new Date().toISOString(),
        success: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error en job ${job.id}:`, errorMessage);

      return {
        sessionId,
        completedAt: new Date().toISOString(),
        success: false,
        errorMessage,
      };
    }
  }
}

/** Instancia singleton del worker */
export const agentWorker = new AgentWorker();
