import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Tipado dinámico del paquete gRPC
const aiEngineProto = grpc.loadPackageDefinition(packageDefinition).ai_engine as any;

/**
 * Cliente gRPC para comunicarse con el AI-Engine en Python.
 * Permite ejecutar tareas pesadas y recibir streaming de progreso.
 */
export class AIEngineClient {
  private client: any;

  constructor(address: string = 'localhost:50051') {
    // Inicializamos el cliente con credenciales inseguras para desarrollo local
    this.client = new aiEngineProto.AIEngine(
      address,
      grpc.credentials.createInsecure()
    );
  }

  /**
   * Ejecuta una tarea en un Worker de Python de forma asíncrona.
   */
  async executeTask(request: any): Promise<any> {
    console.log(`--- [gRPC CLIENT] Enviando tarea: ${request.worker_name} ---`);
    
    return new Promise((resolve, reject) => {
      this.client.ExecuteWorkerTask(request, (error: any, response: any) => {
        if (error) {
          console.error(`❌ Error en llamada gRPC: ${error.message}`);
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Inicia un flujo de streaming para ver el progreso del worker en tiempo real.
   */
  streamProgress(request: any): grpc.ClientReadableStream<any> {
    console.log(`--- [gRPC CLIENT] Iniciando stream de progreso para: ${request.worker_name} ---`);
    return this.client.StreamWorkerProgress(request);
  }
}

// Exportamos una instancia por defecto (Singleton pattern para la Startup)
export const aiEngineClient = new AIEngineClient();
