# Spec: feat(healthchecks-145)

## Requerimientos
1.  **Backend Health Endpoint**: El endpoint `GET /health` debe devolver un status 200 si todas las dependencias críticas están operativas.
    - **Redis**: Debe responder al comando `PING`.
    - **AI-Engine**: El canal gRPC debe estar en estado `READY` o responder a un `CheckHealth`.
2.  **AI-Engine Health Endpoint**: 
    - **gRPC**: Debe implementar el servicio de salud estándar de gRPC o un método `Ping` personalizado.
    - **HTTP**: El endpoint `/health` (FastAPI) debe seguir operativo.
3.  **Docker Orchestration**: Docker Compose debe usar estos checks para determinar el estado `healthy` de los servicios y orquestar el `depends_on` correctamente.

## Escenarios de Prueba
- **Escenario 1**: Todo OK -> `/health` devuelve 200 y JSON con estados.
- **Escenario 2**: Redis Caído -> `/health` devuelve 503 (Service Unavailable) y detalla que Redis falló.
- **Escenario 3**: AI-Engine Caído -> `/health` devuelve 503 y detalla fallo en gRPC.
