# Diseño Técnico: Robustecimiento de Observabilidad (#150)

## Decisiones de Arquitectura

### D1: Uso de Winston como motor principal
- **Por qué:** Soporta múltiples "transports" (Consola, Archivo, HTTP), lo que nos permitirá en el futuro enviar logs al Dashboard o a un ELK stack sin cambiar el código de los agentes.
- **Alternativas:** `Pino` (más rápido pero menos flexible en configuración de transports complejos) o `console.log` (lo que tenemos hoy, insuficiente).

### D2: Mantener interfaz SacredLogger (Patrón Proxy/Wrapper)
- **Por qué:** Evitar un refactor masivo en todos los nodos del grafo que ya usan `SacredLogger`. Cambiamos el motor interno pero mantenemos la API externa estable.

### D3: Formato XML-Friendly
- **Por qué:** Para que el Dashboard pueda parsear los logs incluso si contienen tags de razonamiento como `<thought>`. Usaremos un formateador personalizado en Winston.

## Cambios en Archivos

### 1. `backend/src/services/loggerService.ts` [NEW]
- Implementación de la clase `LoggerService` que instancia `winston.createLogger`.
- Configuración de formato con timestamps y colores.

### 2. `backend/src/helpers/logger.ts` [MODIFY]
- Reemplazar implementaciones manuales con llamadas a `LoggerService`.

### 3. `backend/src/services/llmService.ts` [MODIFY]
- Reemplazar `SacredLogger.info` por niveles específicos (`info` para éxitos, `warn` para reintentos, `error` para fallos de red).
