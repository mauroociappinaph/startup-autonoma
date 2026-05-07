# Change Proposal: Worker Progress Streaming Infrastructure (Issue #198)

## Intent
Estandarizar y activar el streaming de progreso en tiempo real para los workers de Python. Esto permitirá que el Dashboard del frontend muestre exactamente qué está haciendo un agente (ej: "Scraping LinkedIn...", "Filtrando leads...") en lugar de mostrar una pantalla de carga estática.

## Scope
- **AI Engine (Core)**: Implementar un `ProgressManager` centralizado.
- **AI Engine (Workers)**: Actualizar el `lead_gen_worker` para emitir eventos de progreso.
- **Backend (Service)**: Integrar el consumo de `StreamWorkerProgress` en el `AIEngineService`.
- **Backend (SSE)**: Canalizar los updates de progreso hacia el canal SSE del Sentinel.

## Proposed Approach
1. **Progress Manager (Python)**:
   - Utilizar `asyncio.Queue` para almacenar temporalmente los eventos de progreso vinculados a un `trace_id`.
   - El método `ExecuteWorkerTask` registrará el inicio de la tarea y enviará actualizaciones a la cola.
   - El método `StreamWorkerProgress` consumirá de la cola y cerrará el stream cuando la tarea principal termine.
2. **Refactor de Workers**:
   - Pasar un objeto `progress_callback` a las funciones de los workers para que puedan emitir updates de forma desacoplada.
3. **Backend Integration**:
   - Cuando se inicia una tarea de AI Engine, el backend abrirá un stream de gRPC paralelo para escuchar el progreso y emitirlo via SSE al frontend.

## Risks
- **Race Conditions**: Asegurar que el stream de progreso no se cierre antes de que el cliente se conecte.
- **Memory Leak**: Limpiar las colas de progreso una vez que el stream se completa o expira.

## User Review Required
> [!IMPORTANT]
> Esta implementación requiere que el Backend maneje dos conexiones gRPC paralelas (una para la tarea y otra para el progreso) o que el worker de Python sea capaz de gestionar el estado de la cola globalmente. Elegiremos la gestión de estado global por `trace_id` en el AI Engine.
