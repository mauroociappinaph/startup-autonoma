from fastapi import FastAPI
import uvicorn
from app.core.grpc_server import serve
import threading
import sys
import os

from dotenv import load_dotenv

# Configurar el path para que los módulos de app sean visibles
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, CURRENT_DIR)
sys.path.insert(0, os.path.join(CURRENT_DIR, "grpc_generated"))

load_dotenv()

app = FastAPI(title="AI Engine - Startup Autónoma")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-engine"}

def run_grpc():
    print("🚀 Iniciando servidor gRPC en el AI Engine...")
    serve()

if __name__ == "__main__":
    # Iniciar gRPC en un hilo separado
    grpc_thread = threading.Thread(target=run_grpc, daemon=True)
    grpc_thread.start()
    
    # Iniciar FastAPI
    port = int(os.getenv("AI_ENGINE_PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
