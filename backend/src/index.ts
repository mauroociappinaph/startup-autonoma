import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import agentRoutes from '@/routes/agentRoutes.js';
import { SystemController } from '@/controllers/systemController.js';
import { agentWorker } from '@/jobs/index.js';
import { closeRedisConnections } from '@/db/redis.js';
import { SacredLogger } from '@/helpers/logger.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares Globales
app.use(cors());
app.use(express.json());

/**
 * Registro de Rutas (Screaming Architecture)
 */
app.use('/api/agents', agentRoutes);

// Health Check delegado al Controller
app.get('/health', SystemController.healthCheck);

app.listen(PORT, () => {
  SacredLogger.info('==========================================================');
  SacredLogger.info(`🏢 Startup Autónoma escuchando en http://localhost:${PORT}`);
  SacredLogger.info(`🚀 API Base: http://localhost:${PORT}/api/agents`);
  SacredLogger.info('==========================================================');

  // Iniciamos el worker de BullMQ al arrancar el servidor
  const concurrency = parseInt(process.env.AGENT_CONCURRENCY || '2', 10);
  agentWorker.start(concurrency);
});

/**
 * Graceful shutdown: esperamos que los jobs activos terminen antes de cerrar.
 */
const shutdown = async (signal: string): Promise<void> => {
  SacredLogger.warn(`Señal ${signal} recibida. Apagando worker y cerrando conexiones...`, "SYSTEM");
  try {
    await agentWorker.stop();
    await closeRedisConnections();
    SacredLogger.success("Apagado completado con éxito.", "SYSTEM");
    process.exit(0);
  } catch (error) {
    SacredLogger.error(`Error durante el apagado: ${error}`, "SYSTEM");
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

