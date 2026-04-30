import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { createRequire } from 'module';
import type { ProtoGrpcType } from '@startup/protos/src/generated/ai_engine.js';
import type { AIEngineClient as _AIEngineClient } from '@startup/protos/src/generated/ai_engine/AIEngine.js';
import type { WorkerTaskResponse__Output } from '@startup/protos/src/generated/ai_engine/WorkerTaskResponse.js';
import type { WorkerProgressUpdate__Output } from '@startup/protos/src/generated/ai_engine/WorkerProgressUpdate.js';
import * as opentelemetry from "@opentelemetry/api";

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
    const options = {
      'grpc.keepalive_time_ms': 10000,
      'grpc.keepalive_timeout_ms': 5000,
      'grpc.keepalive_permit_without_calls': 1,
      'grpc.http2.max_pings_without_data': 0,
      'grpc.http2.min_time_between_pings_ms': 10000,
      'grpc.http2.min_ping_interval_without_data_ms': 5000,
      'grpc.default_deadline_ms': 300000, // 5 minutos por defecto para tareas pesadas
      'grpc.max_receive_message_length': 64 * 1024 * 1024, // 64MB
      'grpc.max_send_message_length': 64 * 1024 * 1024, // 64MB
    };

    this.client = new aiEngineProto.AIEngine(
      address,
      grpc.credentials.createInsecure(),
      options
    );
  }

  /**
   * Ejecuta una tarea en un Worker de Python.
   */
  async executeTask(input: { worker_name: string; task_description: string; trace_id: string; payload?: object }): Promise<WorkerTaskResponse__Output> {
    const tracer = opentelemetry.trace.getTracer("grpc-client");
    
    return tracer.startActiveSpan(`GRPC_CALL:${input.worker_name}`, async (span): Promise<WorkerTaskResponse__Output> => {
      console.log(`--- [gRPC CLIENT] Enviando tarea: ${input.worker_name} ---`);
      
      const metadata = new grpc.Metadata();
      opentelemetry.propagation.inject(opentelemetry.context.active(), metadata, {
        set: (carrier, key, value) => carrier.set(key, value as string | Buffer)
      });

      const grpcInput = {
        worker_name: input.worker_name,
        task_description: input.task_description,
        trace_id: input.trace_id,
        payload: input.payload || {},
      };

      span.setAttributes({
        "rpc.system": "grpc",
        "rpc.service": "ai_engine.AIEngine",
        "rpc.method": "ExecuteWorkerTask",
        "worker.name": input.worker_name
      });

      return new Promise((resolve, reject) => {
        this.client.ExecuteWorkerTask(grpcInput, metadata, (error: grpc.ServiceError | null, output?: WorkerTaskResponse__Output) => {
          if (error) {
            console.error(`❌ Error en llamada gRPC (ExecuteTask): ${error.message}`);
            span.recordException(error);
            span.setStatus({ code: opentelemetry.SpanStatusCode.ERROR });
            reject(error);
          } else if (!output) {
            const err = new Error("No response received from server");
            span.recordException(err);
            span.setStatus({ code: opentelemetry.SpanStatusCode.ERROR });
            reject(err);
          } else {
            console.log(`✅ Tarea ${input.worker_name} completada.`);
            span.setStatus({ code: opentelemetry.SpanStatusCode.OK });
            resolve(output);
          }
          span.end();
        });
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

  /**
   * Verifica la salud del AI-Engine vía gRPC.
   */
  async ping(): Promise<boolean> {
    return new Promise((resolve) => {
      this.client.Ping({}, { deadline: Date.now() + 2000 }, (error, response) => {
        if (error || !response || response.status !== 'healthy') {
          console.error(`❌ AI-Engine Health Check falló: ${error?.message}`);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   * Cierra el canal gRPC de forma segura.
   */
  public close(): void {
    this.client.close();
    console.log("🔌 [gRPC CLIENT] Conexión cerrada.");
  }
}

export const aiEngineClient = new AIEngineClient();
