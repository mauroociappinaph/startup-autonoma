import asyncio
import logging

import grpc

from app.grpc_generated import ai_engine_pb2, ai_engine_pb2_grpc

# Importamos la función del worker (ahora asíncrona)
from app.workers.lead_gen_worker import process_lead_generation_task
from app.core.progress_manager import progress_manager

logging.basicConfig(level=logging.INFO)

class AIEngineServicer(ai_engine_pb2_grpc.AIEngineServicer):
    async def ExecuteWorkerTask(self, request, context):
        print(f"--- [GRPC SERVER] Received task: {request.worker_name} ---")
        print(f"Payload: {request.payload}")
        print(f"Trace ID: {request.trace_id}")

        try:
            if request.worker_name == "lead_gen":
                # Despachamos la tarea de manera asíncrona
                result = await process_lead_generation_task(request.payload, request.trace_id)
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

    async def StreamWorkerProgress(self, request, context):
        trace_id = request.trace_id
        print(f"--- [GRPC SERVER] Client subscribed to progress: {trace_id} ---")
        
        queue = await progress_manager.get_queue(trace_id)
        
        try:
            while True:
                # Esperar el siguiente update de la cola
                update = await queue.get()
                
                # Si recibimos None, la tarea terminó
                if update is None:
                    break
                    
                yield ai_engine_pb2.WorkerProgressUpdate(
                    status=update["status"],
                    progress_percentage=update["progress"],
                    log_message=update["log"],
                    trace_id=trace_id
                )
                queue.task_done()
        except Exception as e:
            print(f"⚠️  Error en stream de progreso ({trace_id}): {e}")
        finally:
            progress_manager.cleanup(trace_id)
            print(f"--- [GRPC SERVER] Progress stream closed: {trace_id} ---")

    async def Ping(self, request, context):
        print("--- [GRPC SERVER] Health Check (Ping) received ---")
        return ai_engine_pb2.PingResponse(status="healthy")

async def serve():
    server = grpc.aio.server()
    ai_engine_pb2_grpc.add_AIEngineServicer_to_server(AIEngineServicer(), server)
    server_address = '[::]:50051'
    server.add_insecure_port(server_address)
    await server.start()
    print(f"🚀 Servidor gRPC asíncrono iniciado. Escuchando en {server_address}")
    try:
        await server.wait_for_termination()
    except asyncio.CancelledError:
        print("🛑 Deteniendo servidor gRPC asíncrono...")
        await server.stop(10)
        print("✅ Servidor gRPC detenido limpiamente.")

if __name__ == '__main__':
    # Para ejecución aislada del servidor gRPC
    logging.basicConfig(level=logging.INFO)
    asyncio.run(serve())
