# Technical Design: Worker Progress Streaming (Issue #198)

## Architecture

### 1. ProgressManager (AI Engine)
Ubicación: `ai-engine/app/core/progress_manager.py` (Nuevo).
```python
class ProgressManager:
    _queues = {} # Dict[trace_id, asyncio.Queue]
    
    @classmethod
    async def push(cls, trace_id, update): ...
    @classmethod
    async def subscribe(cls, trace_id): ...
```

### 2. gRPC Servicer (AI Engine)
Ubicación: `ai-engine/app/core/grpc_server.py`.
- `ExecuteWorkerTask`: Inyecta el `ProgressManager.push` como callback al worker.
- `StreamWorkerProgress`: Llama a `ProgressManager.subscribe` y hace un loop enviando mensajes hasta que reciba un mensaje de "FIN".

### 3. AIEngineService (Backend)
Ubicación: `backend/src/services/aiEngineService.ts`.
- Agregar un método `streamProgress(traceId)` que abra el stream de gRPC.
- Al iniciar una tarea, disparar el stream en background (o delegar al Sentinel).

### 4. SSE Integration (Backend)
El `AduanaSentinel` (o el servicio de eventos) debe recibir estos updates y emitirlos via SSE con un canal tipo `agent_progress`.

## Verification Plan
- **Mock Client**: Un script en Node.js que llame a `ExecuteWorkerTask` y `StreamWorkerProgress` simultáneamente.
- **Manual**: Ver los logs en el Dashboard del Frontend.
