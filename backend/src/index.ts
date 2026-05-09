import 'dotenv/config';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { SENTRY_DSN_BACKEND, SENTRY_ENABLED } from '@/config/env.js';

if (SENTRY_ENABLED && SENTRY_DSN_BACKEND) {
  Sentry.init({
    dsn: SENTRY_DSN_BACKEND,
    integrations: [
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });
}

import './services/telemetryService.js';
import express from 'express';
import cors from 'cors';
import { PORT, AGENT_CONCURRENCY } from '@/config/env.js';
import agentRoutes from '@/routes/agentRoutes.js';
import projectRoutes from '@/routes/projectRoutes.js';
import telemetryRoutes from '@/routes/telemetryRoutes.js';
import { SystemController } from '@/controllers/systemController.js';
import { agentWorker, setupRedisJanitor, systemWorker } from '@/jobs/index.js';
import { closeRedisConnections } from '@/db/redis.js';
import { services } from '@/services/index.js';
import { initializeSkills } from '@/skills/loader.js';

initializeSkills();

import { tracingMiddleware } from '@/middleware/tracingMiddleware.js';

const app = express();


// Middlewares Globales
app.use(tracingMiddleware);
app.use(cors());
app.use(express.json());

/**
 * Registro de Rutas (Screaming Architecture)
 */
app.use('/api/agents', agentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/telemetry', telemetryRoutes);

// Health Check delegado al Controller
app.get('/health', SystemController.healthCheck);

app.listen(PORT, () => {
  services.logger.info('==========================================================');
  services.logger.info(`🏢 Startup Autónoma escuchando en http://localhost:${PORT}`);
  services.logger.info(`🚀 API Base: http://localhost:${PORT}/api/agents`);
  services.logger.info('==========================================================');

  // Iniciamos el worker de BullMQ al arrancar el servidor
  agentWorker.start(AGENT_CONCURRENCY);


  // Iniciamos el Janitor de Redis (Gap 144)
  setupRedisJanitor().catch(err => services.logger.error(`Error al programar Janitor: ${err.message}`, "INFRA"));
});

/**
 * Graceful shutdown: esperamos que los jobs activos terminen antes de cerrar.
 */
const shutdown = async (signal: string): Promise<void> => {
  services.logger.warn(`Señal ${signal} recibida. Apagando worker y cerrando conexiones...`, "SYSTEM");
  try {
    await agentWorker.stop();
    await systemWorker.close();
    await closeRedisConnections();
    services.logger.success("Apagado completado con éxito.", "SYSTEM");
    process.exit(0);
  } catch (error) {
    services.logger.error(`Error durante el apagado: ${error}`, "SYSTEM");
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

