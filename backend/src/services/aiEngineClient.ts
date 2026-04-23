import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { createRequire } from 'module';
import type { ProtoGrpcType } from '@startup/protos/src/generated/ai_engine.js';
import type { AIEngineClient as _AIEngineClient } from '@startup/protos/src/generated/ai_engine/AIEngine.js';
import type { WorkerTaskResponse__Output } from '@startup/protos/src/generated/ai_engine/WorkerTaskResponse.js';
import type { WorkerProgressUpdate__Output } from '@startup/protos/src/generated/ai_engine/WorkerProgressUpdate.js';

const require = createRequire(import.meta.url);
const PROTO_PATH = require.resolve('@startup/protos/src/ai_engine.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const aiEngineProto = (grpc.loadPackageDefinition(packageDefinition) as unknown as ProtoGrpcType).ai_engine;

/**
 * Cliente gRPC para comunicarse con el AI-Engine en Python.
 */
export class AIEngineClient {
  private client: _AIEngineClient; 

  constructor(address: string = 'localhost:50051') {
    this.client = new aiEngineProto.AIEngine(
      address,
      grpc.credentials.createInsecure()
    );
  }

  /**
   * Ejecuta una tarea en un Worker de Python.
   */
  async executeTask(input: { worker_name: string; task_description: string; trace_id: string; payload?: object }): Promise<WorkerTaskResponse__Output> {
    console.log(`--- [gRPC CLIENT] Enviando tarea: ${input.worker_name} ---`);

    const grpcInput = {
      worker_name: input.worker_name,
      task_description: input.task_description,
      trace_id: input.trace_id,
      payload: input.payload || {},
    };

    return new Promise((resolve, reject) => {
      this.client.ExecuteWorkerTask(grpcInput, (error: grpc.ServiceError | null, output?: WorkerTaskResponse__Output) => {
        if (error) {
          console.error(`❌ Error en llamada gRPC (ExecuteTask): ${error.message}`);
          reject(error);
        } else if (!output) {
          reject(new Error("No response received from server"));
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
  streamProgress(input: { worker_name: string; task_description: string; trace_id: string; payload?: object }): grpc.ClientReadableStream<WorkerProgressUpdate__Output> {
    console.log(`--- [gRPC CLIENT] Iniciando stream de progreso para: ${input.worker_name} ---`);

    const grpcInput = {
      worker_name: input.worker_name,
      task_description: input.task_description,
      trace_id: input.trace_id,
      payload: input.payload || {},
    };
    
    return this.client.StreamWorkerProgress(grpcInput);
  }
}

export const aiEngineClient = new AIEngineClient();
