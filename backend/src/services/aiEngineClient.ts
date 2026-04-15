import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenemos __filename y __dirname de forma segura para módulos ES
const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

/**
 * Ruta al archivo .proto (asumimos que la raíz está tres niveles arriba desde src/services)
 */
const PROTO_PATH = path.resolve(__dirname, '../../../protos/ai_engine.proto');

/**
 * Carga dinámica del contrato gRPC para el backend.
 */
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

/**
 * Interfaces para los mensajes gRPC
 */
interface WorkerTaskResponse {
  success: boolean;
  message: string;
  result?: object;
  error_code?: string;
}

interface WorkerProgressUpdate {
  status: string;
  progress_percentage: number;
  log_message: string;
  trace_id: string;
}

// Tipado dinámico del paquete gRPC
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const aiEngineProto = (grpc.loadPackageDefinition(packageDefinition).ai_engine as any);

/**
 * Cliente gRPC para comunicarse con el AI-Engine en Python.
 * Permite ejecutar tareas pesadas y recibir streaming de progreso.
 */
export class AIEngineClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private client: any;

  constructor(address: string = 'localhost:50051') {
    // Inicializamos el cliente con credenciales inseguras para desarrollo local
    // En producción, usar credenciales seguras (TLS) es MANDATORIO.
    this.client = new aiEngineProto.AIEngine(
      address,
      grpc.credentials.createInsecure()
    );
  }

  /**
   * Ejecuta una tarea en un Worker de Python de forma asíncrona.
   * @param request - Objeto con la descripción de la tarea y payload.
   */
  async executeTask(request: { worker_name: string; task_description: string; trace_id: string; payload?: object }): Promise<WorkerTaskResponse> {
    console.log(`--- [gRPC CLIENT] Enviando tarea: ${request.worker_name} ---`);

    // Mapeamos el request a la estructura esperada por el proto
    const grpcRequest = {
      worker_name: request.worker_name,
      task_description: request.task_description,
      trace_id: request.trace_id,
      payload: request.payload || {}, // Payload es opcional
    };

    return new Promise((resolve, reject) => {
      this.client.ExecuteWorkerTask(grpcRequest, (error: grpc.ServiceError | null, response: WorkerTaskResponse) => {
        if (error) {
          console.error(`❌ Error en llamada gRPC (ExecuteTask): ${error.message}`);
          reject(error);
        } else {
          console.log(`✅ Tarea ${request.worker_name} completada.`);
          resolve(response);
        }
      });
    });
  }

  /**
   * Inicia un flujo de streaming para ver el progreso del worker en tiempo real.
   * Devuelve un stream de objetos WorkerProgressUpdate.
   */
  streamProgress(request: { worker_name: string; task_description: string; trace_id: string; payload?: object }): grpc.ClientReadableStream<WorkerProgressUpdate> {
    console.log(`--- [gRPC CLIENT] Iniciando stream de progreso para: ${request.worker_name} ---`);

    const grpcRequest = {
      worker_name: request.worker_name,
      task_description: request.task_description,
      trace_id: request.trace_id,
      payload: request.payload || {},
    };
    return this.client.StreamWorkerProgress(grpcRequest);
  }
}

// Exportamos una instancia por defecto (Singleton pattern para la Startup)
export const aiEngineClient = new AIEngineClient();
