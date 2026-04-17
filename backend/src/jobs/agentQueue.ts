import { Queue } from "bullmq";
import { getRedisConnection } from "@/db/redis.js";
import { AgentJobData, AgentJobDataSchema } from "@/types/agent-job.types.js";
import { randomUUID } from "crypto";

/** Nombre canónico de la cola de agentes */
export const AGENT_QUEUE_NAME = "agent-executions";

let agentQueue: Queue<AgentJobData> | null = null;

/**
 * Retorna la instancia singleton de la Queue de agentes.
 * La cola es la única puerta de entrada al grafo — nunca llamar al grafo directamente desde el API.
 */
export const getAgentQueue = (): Queue<AgentJobData> => {
  if (!agentQueue) {
    agentQueue = new Queue<AgentJobData>(AGENT_QUEUE_NAME, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        removeOnComplete: { count: 100 },  // Mantener los últimos 100 jobs completados
        removeOnFail: { count: 50 },
      },
    });

    console.log(`📋 AgentQueue inicializada: "${AGENT_QUEUE_NAME}"`);
  }
  return agentQueue;
};

/**
 * Encola una nueva ejecución de agente.
 * @returns { jobId, sessionId } para que el cliente pueda hacer polling/SSE.
 */
export const enqueueAgentJob = async (
  prompt: string,
  projectId?: string,
): Promise<{ jobId: string; sessionId: string }> => {
  const sessionId = randomUUID();

  const jobData: AgentJobData = AgentJobDataSchema.parse({
    prompt,
    sessionId,
    projectId,
    enqueuedAt: new Date().toISOString(),
  });

  const queue = getAgentQueue();
  const job = await queue.add("run-agent", jobData, {
    jobId: sessionId, // Usamos sessionId como jobId para trazabilidad directa
  });

  console.log(`📥 Job encolado: ${job.id} | session: ${sessionId}`);

  return { jobId: job.id as string, sessionId };
};
