import asyncio
import os
import sys
from contextlib import asynccontextmanager

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI

from app.core.grpc_server import serve

# Configurar el path para que los módulos de app sean visibles
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, CURRENT_DIR)
sys.path.insert(0, os.path.join(CURRENT_DIR, "grpc_generated"))

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Iniciar servidor gRPC como una tarea del event loop en background
    grpc_task = asyncio.create_task(serve())
    yield
    # Opción de detener gracefully si implementamos server.stop()
    grpc_task.cancel()

app = FastAPI(title="AI Engine - Startup Autónoma", lifespan=lifespan)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-engine"}

if __name__ == "__main__":
    port = int(os.getenv("AI_ENGINE_PORT", 8000))
    # Uvicorn manejará su propio event loop, y nuestro lifespan montará gRPC en él
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
