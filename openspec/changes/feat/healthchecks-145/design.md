# Design: feat(healthchecks-145)

## Arquitectura

### 1. gRPC Health Check
Agregaremos un método simple al proto para evitar depender de librerías externas de healthcheck en esta etapa inicial.
```proto
service AIEngine {
  rpc Ping (Empty) returns (PingResponse);
  ...
}
message Empty {}
message PingResponse {
  string status = 1;
}
```

### 2. Backend Logic
Refactorizaremos el `SystemController` para que use un patrón de "Checkers".
- `RedisChecker`: Llama a `redis.ping()`.
- `AIEngineChecker`: Llama a `aiEngineClient.ping()`.

### 3. AI-Engine Logic
- En `app/core/grpc_server.py`, implementaremos el método `Ping`.
- El Dockerfile se actualizará para usar `CMD ["python", "app/main.py"]` lo que levantará tanto FastAPI como gRPC.

## Diagrama de Flujo
```mermaid
graph TD
    User[/health] --> Backend
    Backend --> Redis[Redis PING]
    Backend --> AI[AI-Engine gRPC Ping]
    AI --> Status{Result?}
    Status -- OK --> Response[200 OK]
    Status -- FAIL --> ResponseErr[503 Service Unavailable]
```
