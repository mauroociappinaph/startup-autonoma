# Proposal: Sentry Integration (Issue #186)

## 1. Intent
Implementar Sentry como la plataforma de observabilidad principal del ecosistema, permitiendo capturar errores y la secuencia de razonamiento (breadcrumbs) de los agentes de IA en todas las capas del monorepo.

## 2. Problem
Actualmente, los errores que ocurren dentro del LangGraph (ej. fallos en workers, timeouts en el CEO) solo se ven como *stacktraces* planos en la consola o en archivos temporales. Esto viola la Ley 9 (Autocorrección Inmediata) ya que no tenemos un registro duradero y analizable en Producción sobre *por qué* el agente falló o qué decisiones (tool calls) tomó antes del crash.

## 3. Solution
Integrar los SDKs de Sentry en los 3 componentes:
- **Backend (Node.js)**: `@sentry/node` y `@sentry/profiling-node`.
- **AI Engine (Python)**: `sentry-sdk[fastapi]`.
- **Frontend (Next.js)**: `@sentry/nextjs`.

Las variables de entorno `SENTRY_DSN_BACKEND`, `SENTRY_DSN_AI_ENGINE` y `SENTRY_DSN_FRONTEND` serán inyectadas en `.env.example` y validadas opcionalmente en `env.ts`.
Si la integración falla localmente al no tener DSNs reales, usaremos *mocks* durante el desarrollo.

## 4. Risks
- **Performance Overhead**: El *Performance Tracing* de Sentry puede introducir latencia marginal. Se configurará un sample rate inicial de 100% para la Beta, con capacidad de reducirse vía variable de entorno.
- **Seguridad (PII)**: Hay que asegurar que los prompts de LangGraph no envíen claves API privadas a los servidores de Sentry en el *context* o *breadcrumbs*.
