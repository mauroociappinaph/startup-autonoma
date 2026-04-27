# Especificación: Sistema de Logging Profesional (#150)

## Requerimientos Funcionales
- El sistema DEBE soportar al menos tres niveles de log: `INFO`, `WARN`, `ERROR`.
- Cada entrada de log DEBE incluir un `timestamp` ISO 8601.
- El sistema DEBE permitir incluir un `contexto` (ej: nombre del nodo o servicio) en cada log.
- En caso de `ERROR`, el sistema DEBE ser capaz de capturar y mostrar el `stack trace` si se proporciona.

## Escenarios de Prueba

### Escenario 1: Emisión de log con contexto
- **Given** que el sistema de logging está inicializado.
- **When** se emite un mensaje de tipo `INFO` con el mensaje "Iniciando nodo" y contexto "CEO".
- **Then** la salida debe contener el timestamp, el nivel `INFO`, el contexto `[CEO]` y el mensaje.

### Escenario 2: Captura de errores críticos
- **Given** una excepción no controlada en un nodo.
- **When** el `SacredLogger.error` es invocado pasando el objeto Error.
- **Then** la salida debe mostrar el nivel `ERROR` en rojo (si es terminal interactiva).
- **Y** debe incluir el stack trace completo para facilitar el debugging.

### Escenario 3: Filtro por LOG_LEVEL
- **Given** la variable de entorno `LOG_LEVEL=warn`.
- **When** se emite un mensaje de tipo `INFO`.
- **Then** el mensaje NO debe aparecer en la salida.
- **When** se emite un mensaje de tipo `WARN`.
- **Then** el mensaje DEBE aparecer en la salida.
