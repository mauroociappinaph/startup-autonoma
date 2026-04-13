# AGENTS.md - The Startup Source of Truth

## --- Misión y Objetivo ---

El sistema es una startup autónoma operada por agentes jerárquicos cuyo objetivo es crear software automáticamente.

**Principios de los Agentes:**
- Autónomos pero coordinados vía **LangGraph.js**.
- Independientes pero colaborativos bajo una jerarquía estricta.
- Capaces de tomar decisiones, delegar y aprender vía **Engram**.

**Jerarquía:**
1.  **Agente CEO (Estratega):** Orquestador principal. Descompone objetivos en planes maestros.
2.  **Agentes Chief:** Coordinan áreas (Software, Business). Gestionan el loop de Workers.
3.  **Agentes Workers:** Ejecutan tareas atómicas (Git, LeadGen, etc.).

---

## --- Estructura del Proyecto (Versión 2026 - Optimizada) ---

```text
/
├── /.github
│   ├── /ISSUE_TEMPLATE
│   ├── /workflows
├── .gitignore
├── /.qwen
│   ├── settings.json
├── AGENTS.md
├── GEMINI.md
├── README.md
├── /ai-engine
│   ├── /.pytest_cache
│   │   ├── /v
│   ├── /app
│   │   ├── /api
│   │   ├── /contracts
│   │   ├── /core
│   │   ├── /helpers
│   │   ├── /tools
│   │   ├── /workers
│   ├── package.json
│   ├── /tests
├── /backend
│   ├── package.json
│   ├── /src
│   │   ├── /agents
│   │   ├── /config
│   │   ├── /contracts
│   │   ├── /controllers
│   │   ├── /db
│   │   ├── /evals
│   │   ├── /graph
│   │   ├── /helpers
│   │   ├── /jobs
│   │   ├── /mcp_ports
│   │   ├── /middleware
│   │   ├── /models
│   │   ├── /nodes
│   │   ├── /observability
│   │   ├── /routes
│   │   ├── /services
│   │   ├── /skills
│   │   ├── /state
│   │   ├── test-run.ts
│   │   ├── test-workflow.ts
│   │   ├── /tools
│   │   ├── /types
│   │   ├── /workers
│   ├── /tests
│   │   ├── ceo_agent.test.ts
│   │   ├── context_manager.test.ts
│   │   ├── git_worker.test.ts
│   │   ├── llm_factory.test.ts
│   │   ├── software_chief.test.ts
│   ├── tsconfig.json
├── commitlint.config.js
├── /docs
│   ├── /agents
│   │   ├── /chiefs
│   │   ├── /workers
│   ├── /architecture
│   ├── /memory
│   ├── /ux
├── /frontend
│   ├── .eslintrc.json
│   ├── next-env.d.ts
│   ├── package.json
│   ├── /public
│   ├── /src
│   │   ├── /api
│   │   ├── /app
│   │   ├── /components
│   │   ├── /helpers
│   │   ├── /hooks
│   │   ├── index.ts
│   │   ├── /store
│   │   ├── /styles
│   │   ├── /types
│   ├── tsconfig.json
├── /infra
├── package-lock.json
├── package.json
├── /scripts
├── /skills
├── tsconfig.json
├── turbo.json
├── /types
```

---

## --- Convenciones de Ingeniería (Leyes Sagradas) ---

Estas reglas aplican a **Node.js, Python y React** sin excepción:

1.  **SRP (Single Responsibility):** Cada componente (nodo, agente, función, herramienta) hace UNA sola cosa.
2.  **DRY (Don't Repeat Yourself):** Toda lógica repetida debe vivir en la carpeta `/helpers` correspondiente.
3.  **Límites de Archivo:** Máximo **300 líneas**. Si se excede, se refactoriza y divide.
4.  **Barrel Files:** Uso obligatorio de `index.ts` (o `__init__.py`) para exportaciones limpias.
5.  **Tipado Estricto:** TypeScript obligatorio con validación **Zod**. Python con Type Hints y Pydantic.
6.  **Inversión de Dependencias (LLMs):** Ningún Agente (Nodo) importa directamente un SDK de IA (OpenAI, Groq, etc.). Todo modelo entra inyectado por la capa `servicios/llmFactory`. Si se cae un proveedor, solo se toca la Factory.
7.  **Resiliencia Activa (Fallback):** Todas las llamadas externas a LLMs deben tener un wrapper de `Retry` (Tolerancia HTTP 429) y un `Fallback` automático hacia un modelo secundario.
8.  **JSDoc/Docstrings:** Documentación obligatoria en toda lógica pública o compleja.
9.  **Types de Typescript:** Siempre van en `/types`. Nunca en los archivos donde se implementan.
10. **Path Aliases Obligatorios:** Prohibido usar rutas relativas complejas (`../../../../`). A las IAs se les da pésimo calcular la profundidad del árbol. Siempre usar los Path Aliases configurados en `tsconfig.json` (ej. `import { tool } from '@/tools/...'`).
11. **Linting y Formateo Automatizado:** El estilo de código NO se debate. Prettier y ESLint (Node) o Ruff (Python) evalúan todo **antes** del commit.
12. **Human-in-the-Loop (HITL):** Prohibido el vuelo libre en rutas críticas. Tareas de despliegue, gasto de dinero o envíos masivos deben incluir un breakpoint (`interrupt_before`) en LangGraph esperando la pre-aprobación humana desde el frontend (SSE).
13. **Truncamiento de Contexto (Anti-Bloat):** Prohibido inyectar el arreglo bruto de `messages` al LLM. LangGraph acumula historial infinitamente. Se debe invocar una utilidad de **Trimming** (`trim_messages(state, maxTokens)`) antes de cada llamado al modelo. De lo contrario, se penalizará con fallas por límite de tokens (Max Context Window).
14. **Structured Outputs (Anti-Alucinación JSON):** Queda prohibido decirle al LLM en el prompt *"devuelve un JSON con esta estructura"*. Todo agente o nodo que genere datos para el estado debe usar obligatoriamente `llm.withStructuredOutput(zodSchema)` para forzar la salida tipada a nivel de proveedor (Groq/Mistral). Sin esto, el parseo fallará estocásticamente.
15. **Resiliencia de Salida (Manual Fallback):** Si un proveedor (ej: NVIDIA NIM) presenta incompatibilidad con el protocolo nativo de Structured Outputs, se debe emplear obligatoriamente la estrategia de fallback en `LLMService`. Esta estrategia combina `StructuredOutputParser` con instrucciones de formato explícitas para garantizar la integridad de los datos sin comprometer la estabilidad del grafo.

---

## --- Tool Development (Tools Lifecycle) ---

Las herramientas son las manos de los agentes. Se crean siguiendo este ciclo:

1.  **Implementation:** See logic in `/backend/src/tools/` (or `/ai-engine/tools/` exposed via **MCP stdio** if Python).
2.  **Contrato Seguro:** Se define el schema de entrada y salida con **Zod** (o Pydantic). 
3.  **Manejo de Errores (Safe Catch):** NINGUNA tool debe crashear el servidor. Todas devuelven un standard de error: `{ success: false, errorMessage: string, accion_requerida: string }`.
4.  **Registro:** Se exponen a través de un **MCP Server** local para que LangGraph.js las consuma sin acoplamiento.

---

## --- Automatización, CI/CD y Autonomía ---

- **Conventional Commits (`commit-msg`):** Obligatorio el uso estricto de formato `tipo(scope): mensaje` evaluado por `@commitlint`. Si la IA o el humano alucina un formato, el commit se destruye.
- **Pre-commit Hooks (Husky):** Evaluación estricta de las Leyes Sagradas, Tipado (TSC) y ejecución de tests unitarios rápidos.
- **Pre-push Hooks (Husky):** Validación final de Lint, Check y Tests en todo el monorepo para evitar deploys rotos al CI.
- **Post-merge Hooks (Husky):** Auto-instalación de dependencias (`npm install`) si el lockfile cambia tras un pull o merge.
- **Orquestación Monorepo (Turbo):** El espacio de trabajo global emplea `Turborepo` para ejecutar la lógica de `dev`, `build` y `lint` en paralelo con caché nativa sobre Node.js y React, abarcando también la protección de `.venv` en Python.
- **Seguridad Continua (Dependabot):** Escaneo semanal y apertura de PRs automáticos frente a librerías obsoletas tanto en Python (`pip`) como en Node (`npm`).
- **Agentic Evals (LLM-as-a-Judge):** Más allá de los tests de código estructurado, todo *output narrativo o semántico* de un agente hacia el cliente es pre-auditado por un "LLM Juez" asíncrono para verificar consistencia, tono y ausencia de alucinaciones fatales.
- **GitHub Actions (`.github/workflows`):** Nuestro pipeline maestro corre sobre `main` y `develop`. Asume la responsabilidad de construcción dura (`Turborepo build`) y verificación de Linters (Ruff, ESLint).
- **Ciclo TDD Autónomo:** Antes de implementar código, se crean los tests (ej. Jest). El Chief ejecuta los tests en la CLI; si fallan, inyecta el `stderr` al Worker iterativamente hasta que pasen.

---

## --- Fuentes de Verdad ---

1.  **Docs de Arquitectura:** `/docs/architecture/`.
2.  **Definición de Estado:** `/backend/src/graph/state.ts` (Incluye `Executive_Summary` y `retry_count`).
3.  **Memoria Semántica (Engram):** Memoria persistente a largo plazo. Los agentes acceden a ella dinámicamente mediante la herramienta/mcp `query_engram_tool` para recuperar el contexto histórico, configuraciones y leyes sagradas antes de planificar o ejecutar, evitando el desborde de su ventana de contexto.
4.  **Protocolo de Comunicación:** Model Context Protocol (MCP) y REST.
