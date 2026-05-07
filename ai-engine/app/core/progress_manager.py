import asyncio
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)

class ProgressManager:
    """
    Gestiona colas de progreso asíncronas vinculadas a identificadores de traza (trace_id).
    Permite que los workers emitan progreso y que el servidor gRPC los retransmita.
    """
    _queues: Dict[str, asyncio.Queue] = {}

    @classmethod
    async def get_queue(cls, trace_id: str) -> asyncio.Queue:
        if trace_id not in cls._queues:
            cls._queues[trace_id] = asyncio.Queue()
            logger.info(f"[PROGRESS] 🆕 Cola creada para trace_id: {trace_id}")
        return cls._queues[trace_id]

    @classmethod
    async def push(cls, trace_id: str, status: str, progress: float, log: str):
        if trace_id in cls._queues:
            update = {
                "status": status,
                "progress": progress,
                "log": log
            }
            await cls._queues[trace_id].put(update)
            print(f"📢 [PYTHON PROGRESS] {status} | {progress}% | {log}")

    @classmethod
    async def close(cls, trace_id: str):
        if trace_id in cls._queues:
            # Enviamos un mensaje especial de finalización
            await cls._queues[trace_id].put(None)
            logger.info(f"[PROGRESS] 🏁 Cola cerrada para trace_id: {trace_id}")

    @classmethod
    def cleanup(cls, trace_id: str):
        if trace_id in cls._queues:
            del cls._queues[trace_id]
            logger.info(f"[PROGRESS] 🧹 Cola eliminada de memoria: {trace_id}")

progress_manager = ProgressManager()
