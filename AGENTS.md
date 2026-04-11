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
├── .github/workflows/                  # CI/CD pipelines (GitHub Actions)

├── /backend (Node.js - Orquestador)
│   ├── src
│   │   ├── index.ts                   # Bootstrap (Express + Graph runner)
│   │   ├── graph/                     # Flujo declarativo (Nodos, Aristas, Estado, Motor)
│   │   ├── agents/                    # Configuración de personalidades
│   │   ├── skills/                    # Primitivas (Prompts + Chains + Bindings)
│   │   ├── herramientas/ (Tools)      # Implementación (Local/Remoto + Zod Contracts)
│   │   ├── servicios/                 # Lógica de negocio + Cliente IA + Orquestación
│   │   ├── workers/                   # Procesos async (BullMQ)
│   │   ├── jobs/                      # Colas
│   │   ├── controladores/             # Adaptadores HTTP
│   │   ├── rutas/                     # Endpoints
│   │   ├── contratos/                 # Schemas Zod y validaciones
│   │   ├── puentos_mcp/               # Adaptadores a servidores MCP (stdio)
│   │   ├── modelos/                   # Esquemas Core
│   │   ├── middleware/                # Cross-cutting (Auth, Trace, Log)
│   │   ├── helpers/                   # Utils puras (No side-effects)
│   │   └── tipos/                     # Tipos internos
│   ├── tests/
│   ├── .eslintrc.json               # Reglas de linting Node
│   ├── .prettierrc                  # Formateo Node
│   └── package.json

├── /ai-engine (Python - Herramientas Pesadas)
│   ├── app/
│   │   ├── main.py                  # FastAPI / Servidor MCP (stdio)
│   │   ├── api/                     # Endpoints REST (si aplica)
│   │   ├── workers/                 # Lógica de scraping, ML, etc.
│   │   ├── herramientas/            # Tools accesibles vía MCP
│   │   ├── contratos/               # Modelos Pydantic
│   │   ├── helpers/                 # Utils Python
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
├── /scripts                         # Codegen + Setup
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
6.  **JSDoc/Docstrings:** Documentación obligatoria en toda lógica pública o compleja.
7.  **Types de Typescript:** Siempre van en `/types`. Nunca en los archivos donde se implementan.
8.  **Rutas relativas:** Siempre usar rutas relativas para importar módulos.
9.  **Linting y Formateo Automatizado:** El estilo de código NO se debate. Prettier y ESLint (Node/React) o Ruff (Python) deben ejecutarse **antes** de cualquier commit. Los agentes no deben gastar tokens discutiendo estilos.

---

## --- Desarrollo de Herramientas (Tools Lifecycle) ---

Las herramientas son las manos de los agentes. Se crean siguiendo este ciclo:

1.  **Implementación:** Se desarrolla la lógica en `/backend/herramientas/` (o `/ai-engine/herramientas/` expuesta vía **MCP stdio** si es Python).
2.  **Contrato Seguro:** Se define el schema de entrada y salida con **Zod** (o Pydantic). 
3.  **Manejo de Errores (Safe Catch):** NINGUNA tool debe crashear el servidor. Todas devuelven un standard de error: `{ success: false, errorMessage: string, accion_requerida: string }`.
4.  **Registro:** Se exponen a través de un **MCP Server** local para que LangGraph.js las consuma sin acoplamiento.

---

## --- Automatización, CI/CD y Autonomía ---

- **Ciclo TDD Autónomo:** Antes de implementar código, se crean los tests (ej. Jest). El Chief ejecuta los tests en la CLI; si fallan, inyecta el `stderr` al Worker iterativamente hasta que pasen, minimizando la carga humana de auditoría.
- **GitHub CLI (`gh`):** Herramienta principal para operar sobre el repo una vez los tests están en verde.
- **GitHub Actions:** Pipeline final de CI/CD.
- **Traceability por Stream:** Cada flujo genera un `trace_id`. La latencia al usuario se mitiga mediante Server-Sent Events (SSE) mostrando progreso en tiempo real.

---

## --- Fuentes de Verdad ---

1.  **Docs de Arquitectura:** `/docs/architecture/`.
2.  **Definición de Estado:** `/backend/src/graph/state.ts` (Incluye `Executive_Summary` y `retry_count`).
3.  **Memoria Semántica:** Conocimiento dinámico en **Engram** (Acceso validado por *Least Privilege Contex* para evitar alucinaciones).
4.  **Protocolo de Comunicación:** Model Context Protocol (MCP) y REST (Abandono explícito de gRPC para el MVP).
