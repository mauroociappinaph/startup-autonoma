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
├── .github/
│   ├── dependabot.yml               # Bot de escaneo de vulnerabilidades
│   └── workflows/                   # CI/CD pipelines (GitHub Actions)
├── .husky/                          # Pre-commit (Lint, Rules) y Commit-msg (Commitlint)

├── /backend (Node.js - Orquestador)
│   ├── src
│   │   ├── index.ts                   # Bootstrap (Express + Graph runner)
│   │   ├── graph/                     # Instanciación del StateGraph general
│   │   ├── state/                     # Definición de Estados y Reducers (TypedDict/Zod)
│   │   ├── nodes/                     # Lógica atómica bloque a bloque (testable)
│   │   ├── evals/                     # LLM-as-a-Judge (Evaluación de alucinaciones)
│   │   ├── agents/                    # Prompts del sistema o ensamblador de sub-grafos
│   │   ├── skills/                    # Primitivas (Prompts + Chains + Bindings)
│   │   ├── tools/                     # Implementación (Local/Remoto + Zod Contracts)
│   │   ├── services/ 
│   │   │   ├── llmFactory.ts          # Patrón Factory para inyección de Modelos. Aisla SDKs.
│   │   │   ├── llmRouter.ts           # Enrutamiento Inteligente (Modelos Rápidos vs Pesados)
│   │   │   └── orchestrator.ts        # Orquestación general de lógica de negocio
│   │   ├── checkpointers/             # Persistencia LangGraph (PostgresSaver / MemorySaver)
│   │   ├── jobs/                      # Colas
│   │   ├── controllers/               # Adaptadores HTTP
│   │   ├── routes/                    # Endpoints
│   │   ├── contracts/                 # Schemas Zod y validaciones (Incluye contratos SSE)
│   │   ├── mcp_ports/                 # Adaptadores a servidores MCP (stdio)
│   │   ├── db/                        # Conexión a DB / Migraciones
│   │   ├── models/                    # Esquemas Core
│   │   ├── middleware/                # Cross-cutting (Auth, Trace, Log)
│   │   ├── observability/             # Debug (Tracer, Logs, LangSmith)
│   │   ├── config/                    # Zod validation para .env secrets
│   │   ├── helpers/                   # Utils puras (No side-effects)
│   │   └── types/                     # Tipos internos
│   ├── tests/
│   ├── .env.example                 # Esquema de Secretos Requeridos
│   ├── .eslintrc.json               # Reglas de linting Node
│   ├── .prettierrc                  # Formateo Node
│   └── package.json

├── /ai-engine (Python - Heavy Tools)
│   ├── app/
│   │   ├── main.py                  # FastAPI / MCP Server (stdio)
│   │   ├── api/                     # REST Endpoints (if applicable)
│   │   ├── workers/                 # Scraping logic, ML, etc.
│   │   ├── tools/                   # Tools accessible via MCP
│   │   ├── contracts/               # Pydantic Models
│   │   ├── helpers/                 # Python Utils
│   │   └── core/                    # Config + Settings
│   ├── tests/
│   ├── pyproject.toml               # Configuración de Ruff (Lint/Format Python)
│   └── requirements.txt

├── /frontend (Next.js 15)
│   ├── src
│   │   ├── app/                     # App Router (Pages, Layouts, API Routes)
│   │   ├── components/              # UI Atómico (Shadcn + Custom)
│   │   ├── hooks/                   # Lógica de React compartida
│   │   ├── store/                   # Zustand (Estado global de UI/SSE)
│   │   ├── api/                     # Clientes Axios / TanStack Query
│   │   ├── helpers/                 # Utilidades de transformación
│   │   ├── styles/                  # Tailwind CSS y config
│   │   └── types/                   # Interfaces locales del front
│   ├── public/                      # Assets estáticos
│   ├── .eslintrc.json               # Reglas de linting React/Next
│   └── .prettierrc                  # Formateo Frontend
├── /types (Monorepo Compartido)
├── /docs                            # Arquitectura, ADRs, Specs
├── /skills                          # Prompts globales
├── /scripts                         # Scritps de validación de Leyes Sagradas y setups
└── /infra                           # Docker + Terraform + Monitoring
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
- **Pre-commit Hooks (Husky):** Evaluación estricta de las Leyes Sagradas (límite de líneas, rutas, convenciones) y ejecución de tests unitarios rápidos. *Nota Arquitectónica:* Nunca se corren operaciones pesadas (como Builders de Next.js) en este hook para no destruir la iteración veloz de los agentes.
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
