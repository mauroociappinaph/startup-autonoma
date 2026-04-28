# Proposal: feat(healthchecks-145)

Implementar un sistema de Healthchecks robusto que valide no solo si los servicios están arriba, sino si sus dependencias críticas son accesibles.

## Problema
Actualmente, el sistema tiene definiciones básicas en Docker Compose pero no hay una validación real de salud en el código que chequee dependencias como Redis o la conexión gRPC entre el Backend y el AI Engine.

## Solución Propuesta
1.  **AI-Engine**:
    - Agregar un método `CheckHealth` al contrato gRPC.
    - Implementar el servicer de salud en Python.
    - Actualizar el Dockerfile para exponer tanto gRPC como el HTTP de FastAPI.
2.  **Backend**:
    - Implementar `checkHealth()` en `AIEngineClient`.
    - Refactorizar `SystemController.healthCheck` para validar:
        - Estado de la base de datos (Postgres).
        - Conexión a Redis (`ping`).
        - Disponibilidad del AI-Engine (gRPC call).
3.  **Docker Compose**:
    - Ajustar los tests de healthcheck para usar las nuevas rutas/metodos implementados.

## Riesgos
- Latencia en el endpoint de salud si los checks tardan mucho. Se usarán timeouts agresivos.
