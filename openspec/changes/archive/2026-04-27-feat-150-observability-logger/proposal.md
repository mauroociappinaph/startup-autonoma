# Propuesta: Robustecimiento de Observabilidad (#150)

## Intención
Migrar el sistema de logging actual (SacredLogger) a una implementación basada en **Winston**. Esto permitirá tener logs estructurados, niveles de severidad (INFO, WARN, ERROR) y facilitará la integración futura con sistemas de monitoreo externos.

## Motivación
Actualmente el backend tiene ~150 `console.log` que generan ruido excesivo. Ante fallas de red o timeouts de los LLM (como vimos en la issue #149), es difícil discernir entre un flujo normal y un error crítico sin un sistema de niveles.

## Alcance
- Instalación de Winston en el backend. ✅ (Hecho)
- Creación de `LoggerService` como motor de logging. ✅ (Hecho)
- Refactor de `SacredLogger` para actuar como interfaz compatible. ✅ (Hecho)
- Integración de niveles de log en `LLMService` y nodos principales.
- Eliminación progresiva de `console.log` manuales en favor del Logger.

## Capacidades
- `observability/logging`: Capacidad de emitir trazas estructuradas con metadatos.
