# Design: Sentry Integration (Issue #186)

## 1. Architecture
El patrón de integración consistirá en inicializar globalmente los SDKs al arranque del proceso principal (`backend/src/index.ts` y `ai-engine/app/main.py`), lo que instrumentará automáticamente la captura de excepciones no controladas y rechazos asíncronos.

Adicionalmente, se integrará de forma manual la captura de *breadcrumbs* usando el `SacredLogger` (`backend/src/helpers/logger.ts`) para que, cuando emitamos logs tipo `info` o `debug` durante la evaluación de los Agentes, estos se anexen al contexto de Sentry. De esta forma, si el nodo falla después, el reporte en Sentry.io tendrá todo el historial impreso.

## 2. API / Contracts
- Node.js: `@sentry/node` (captura core) + `@sentry/profiling-node` (para trazas de performance).
- FastAPI: `sentry_sdk` (integración nativa con middleware de FastAPI).
- Entornos Locales: Sentry se configurará para que, si las URL de los DSNs son nulas o inválidas, el SDK simplemente se desactive pasivamente sin romper la aplicación (comportamiento por defecto del SDK de Sentry).

## 3. Environment Context
- Variables requeridas (opcionales para modo desarrollo, necesarias en staging/prod):
  - `SENTRY_DSN_BACKEND`
  - `SENTRY_DSN_AI_ENGINE`
  - `SENTRY_DSN_FRONTEND`
