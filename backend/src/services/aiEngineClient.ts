import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenemos __filename y __dirname de forma segura para módulos ES
const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

const PROTO_PATH = path.resolve(__dirname, '../../../protos/ai_engine.proto');

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
interface WorkerTaskOutput {
  success: boolean;
  message: string;
  result?: object;
  error_code?: string;
}

interface ProgressUpdate {
  status: string;
  progress_percentage: number;
  log_message: string;
  trace_id: string;
}

/**
 * Definición estructural del paquete gRPC (Ley de Tipado Estricto)
 */
interface AIEngineProtoDefinition {
  AIEngine: {
    new (address: string, credentials: grpc.ChannelCredentials): unknown;
  };
}

// Usamos unknown como puente para evitar el pecado del any directo
const aiEngineProto = (grpc.loadPackageDefinition(packageDefinition).ai_engine as unknown as AIEngineProtoDefinition);

/**
 * Cliente gRPC para comunicarse con el AI-Engine en Python.
 */
export class AIEngineClient {
  private client: unknown; 

  constructor(address: string = 'localhost:50051') {
    this.client = new aiEngineProto.AIEngine(
      address,
      grpc.credentials.createInsecure()
    );
  }

  /**
   * Ejecuta una tarea en un Worker de Python.
   */
  async executeTask(input: { worker_name: string; task_description: string; trace_id: string; payload?: object }): Promise<WorkerTaskOutput> {
    console.log(`--- [gRPC CLIENT] Enviando tarea: ${input.worker_name} ---`);

    const grpcInput = {
      worker_name: input.worker_name,
      task_description: input.task_description,
      trace_id: input.trace_id,
      payload: input.payload || {},
    };

    return new Promise((resolve, reject) => {
      // @ts-expect-error - El cliente de gRPC es dinámico
      this.client.ExecuteWorkerTask(grpcInput, (error: grpc.ServiceError | null, output: WorkerTaskOutput) => {
        if (error) {
          console.error(`❌ Error en llamada gRPC (ExecuteTask): ${error.message}`);
          reject(error);
        } else {
          console.log(`✅ Tarea ${input.worker_name} completada.`);
          resolve(output);
        }
      });
    });
  }

  /**
   * Inicia un flujo de streaming para ver el progreso del worker.
   */
  streamProgress(input: { worker_name: string; task_description: string; trace_id: string; payload?: object }): grpc.ClientReadableStream<ProgressUpdate> {
    console.log(`--- [gRPC CLIENT] Iniciando stream de progreso para: ${input.worker_name} ---`);

    const grpcInput = {
      worker_name: input.worker_name,
      task_description: input.task_description,
      trace_id: input.trace_id,
      payload: input.payload || {},
    };
    // @ts-expect-error - El cliente de gRPC es dinámico
    return this.client.StreamWorkerProgress(grpcInput);
  }
}

export const aiEngineClient = new AIEngineClient();
