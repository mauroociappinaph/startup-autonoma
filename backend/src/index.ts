import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import agentRoutes from '@/routes/agentRoutes.js';
import { SystemController } from '@/controllers/systemController.js';

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
  console.log('==========================================================');
  console.log(`🏢 Startup Autónoma escuchando en http://localhost:${PORT}`);
  console.log(`🚀 API Base: http://localhost:${PORT}/api/agents`);
  console.log('==========================================================');
});
