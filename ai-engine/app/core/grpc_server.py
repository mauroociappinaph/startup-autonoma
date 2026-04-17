import grpc
from app.grpc_generated import ai_engine_pb2
from app.grpc_generated import ai_engine_pb2_grpc
from concurrent import futures
from google.protobuf import json_format
import logging
import os
import sys

# Los paths ya están configurados por el sistema de paquetes de Python

# Importamos la función del worker
from app.workers.lead_gen_worker import process_lead_generation_task 

logging.basicConfig(level=logging.INFO)

class AIEngineServicer(ai_engine_pb2_grpc.AIEngineServicer):
    def ExecuteWorkerTask(self, request, context):
        print(f"--- [GRPC SERVER] Received task: {request.worker_name} ---")
        print(f"Payload: {request.payload}")
        print(f"Trace ID: {request.trace_id}")

        try:
            if request.worker_name == "lead_gen":
                # Despachamos la tarea al LeadGenWorker
                result = process_lead_generation_task(request.payload, request.trace_id)
            # Añadiremos más workers aquí en el futuro (ej: market_analyzer, etc.)
            # elif request.worker_name == "market_analyzer":
            #     result = process_market_analysis_task(request.payload, request.trace_id)
            else:
                # Si el worker no es reconocido, devolvemos un error
                result = ai_engine_pb2.WorkerTaskResponse(
                    success=False,
                    message=f"Worker '{request.worker_name}' no reconocido.",
                    error_code="UNKNOWN_WORKER",
                    trace_id=request.trace_id
                )
                
            return result

        except Exception as e:
            print(f"❌ Error procesando tarea: {e}")
            return ai_engine_pb2.WorkerTaskResponse(
                success=False,
                message=f"Error procesando tarea: {e}",
                error_code="INTERNAL_ERROR",
                trace_id=request.trace_id
            )

    def StreamWorkerProgress(self, request, context):
        print(f"--- [GRPC SERVER] Streaming progreso para: {request.worker_name} ---")
        # Simulación de streaming de progreso
        for i in range(1, 6):
            yield ai_engine_pb2.WorkerProgressUpdate(
                status=f"Processing step {i}/5",
                progress_percentage=i*20,
                log_message=f"Simulating step {i}",
                trace_id=request.trace_id
            )
        yield ai_engine_pb2.WorkerProgressUpdate(status="Finalizing", progress_percentage=100, log_message="Streaming finalizado", trace_id=request.trace_id)

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    ai_engine_pb2_grpc.add_AIEngineServicer_to_server(AIEngineServicer(), server)
    server_address = '[::]:50051'
    server.add_insecure_port(server_address)
    server.start()
    print(f"🚀 Servidor gRPC iniciado. Escuchando en {server_address}")
    try:
        # Mantenemos el servidor corriendo hasta que se interrumpe
        while True:
            server.wait_for_termination()
    except KeyboardInterrupt:
        server.stop(0)
        print("Servidor gRPC detenido.")

if __name__ == '__main__':
    serve()
