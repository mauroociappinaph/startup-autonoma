# Specifications: Sentry Integration (Issue #186)

## 1. Requirements
- **REQ-1**: El sistema debe inicializar el SDK de Sentry en el Backend de Node.js al arrancar `backend/src/index.ts`.
- **REQ-2**: El sistema debe inicializar el SDK de Sentry en FastAPI al arrancar `ai-engine/app/main.py`.
- **REQ-3**: Las configuraciones de Sentry (`SENTRY_DSN_BACKEND`, `SENTRY_DSN_AI_ENGINE`) deben validarse en tiempo de inicio para prevenir fallos silentes (Opcionales con defaults de mock durante dev).
- **REQ-4**: (Draft para Frontend) Dejar la semilla o instalación inicial para el dashboard de Next.js, aunque el esfuerzo principal sea en la lógica autónoma (LangGraph).

## 2. Scenarios
- **Scenario A (Error in AI Worker)**: Un worker de Python genera una excepción al parsear HTML (Scraping). La excepción viaja a Sentry.io taggeada bajo el proyecto de AI-Engine con el contexto HTTP de FastAPI.
- **Scenario B (Error in Graph Orchestration)**: El `CEO` node decide un estado erróneo. El error de Node viaja a Sentry.io, y se anexa como *breadcrumb* el último mensaje del estado (State) de LangGraph.
