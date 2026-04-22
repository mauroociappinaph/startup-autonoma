import { Worker, Job } from "bullmq";
import { getRedisConnection } from "@/db/redis.js";
import { AgentJobData, AgentJobResult } from "@/types/agent-job.types.js";
import { GraphService } from "@/services/graphService.js";
import { AGENT_QUEUE_NAME } from "@/jobs/agentQueue.js";
import { projectService } from "@/services/projectService.js";
import { gitWorker } from "@/nodes/workers/gitWorker.js";
import { EventBus } from "@/services/eventBus.js"; // Nuevo sistema nervioso
import fs from "fs/promises";
import path from "path";

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
    const { prompt, sessionId, projectId, repoUrl } = job.data;

    console.log(`🧠 Procesando job ${job.id} | prompt: "${prompt.substring(0, 60)}..."`);

    try {
      // Resolvemos el contexto de proyecto (Gap 2)
      // Si no hay projectId, usamos uno genérico para mantener retrocompatibilidad
      const projectName = projectId || "default-startup";
      const projectContext = await projectService.getOrCreateProject(projectName, repoUrl);

      // Lógica de Auto-Clone robusta (Gap 3)
      // Si no existe la carpeta .git y tenemos una URL de repo, clonamos
      const hasGit = await fs.stat(path.join(projectContext.workDir, ".git"))
        .then(() => true)
        .catch(() => false);

      if (!hasGit && projectContext.repoUrl) {
        console.log(`🚚 Workspace de [${projectName}] sin .git. Clonando: ${projectContext.repoUrl}`);
        await gitWorker({
          payload: {
            action: 'clone',
            repoUrl: projectContext.repoUrl
          },
          repoPath: projectContext.workDir
        });
      }

      // Consumimos el stream del grafo inyectando el contexto de aislamiento
      // y publicamos cada evento en el EventBus para el streaming SSE (Gap 4)
      const stream = GraphService.runAgentStream(prompt, sessionId, projectContext);

      for await (const event of stream) {
        await EventBus.publish(sessionId, event);
      }

      // Notificamos finalización exitosa al stream (Gap 4)
      await EventBus.publish(sessionId, { type: "end", status: "completed" });

      return {
        sessionId,
        completedAt: new Date().toISOString(),
        success: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error en job ${job.id}:`, errorMessage);

      // Publicamos el error para que el SSE no quede colgado (Gap 1)
      await EventBus.publish(sessionId, {
        type: "error",
        error: errorMessage,
      });

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
