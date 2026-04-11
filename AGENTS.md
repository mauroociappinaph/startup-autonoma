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
│   │   ├── contratos/                 # Backend ↔ AI Engine (OpenAPI/Zod)
│   │   ├── modelos/                   # Esquemas Core
│   │   ├── middleware/                # Cross-cutting (Auth, Trace, Log)
│   │   ├── observabilidad/            # Debug (Tracer, Logs, Persistencia)
│   │   ├── configuracion/             # Env Parsing tipado
│   │   ├── helpers/                   # Utils puras (No side-effects)
│   │   └── tipos/                     # Tipos internos
│   ├── tests/
│   └── package.json

├── /ai-engine (Python - Ejecutor IA)
│   ├── app/
│   │   ├── main.py                  # FastAPI Entrypoint
│   │   ├── api/                     # Capa HTTP + Deps
│   │   ├── workers/                 # Agentes especializados
│   │   ├── razonamiento/            # Planning + Multistep logic
│   │   ├── herramientas/            # Tools pesadas (ML/Scraping)
│   │   ├── servicios/               # Orquestación interna
│   │   ├── contratos/               # Sync con Backend
│   │   ├── helpers/                 # Utils Python
│   │   └── core/                    # Config + Settings
│   ├── tests/
│   └── requirements.txt

├── /frontend (Next.js 15)
│   ├── src/...                      # Estructura standard (Components, Hooks, Store)

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

---

## --- Desarrollo de Herramientas (Tools Lifecycle) ---

Las herramientas son las manos de los agentes. Se crean siguiendo este ciclo:

1.  **Implementación:** Se desarrolla la lógica en `/backend/herramientas/` (o `/ai-engine/herramientas/` si requiere Python).
2.  **Contrato:** Se define el schema de entrada y salida con **Zod** (o Pydantic en Python) para garantizar integridad.
3.  **Registro:** Se exponen a través del **MCP Server** para que los agentes las descubran.

---

## --- Automatización & CI/CD ---

- **GitHub CLI (`gh`):** Herramienta principal para operar sobre el repo.
- **GitHub Actions:** Pipeline de tests, linting y despliegue continuo.
- **Traceability:** Cada flujo genera un `trace_id` persistente para logs, transmitido nativamente en los headers de gRPC.

---

## --- Fuentes de Verdad ---

1.  **Docs de Arquitectura:** `/docs/architecture/`.
2.  **Definición de Estado:** `/backend/src/graph/state.ts`.
3.  **Memoria Semántica:** Conocimiento dinámico en **Engram**.
4.  **Protocolo de Comunicación:** gRPC (Backend ↔ AI Engine) para baja latencia.
