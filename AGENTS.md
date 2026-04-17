# AGENTS.md - The Startup Source of Truth

## --- Misión y Objetivo ---

El sistema es una startup autónoma operada por agentes jerárquicos cuyo objetivo es crear software automáticamente.

**Principios de los Agentes:**
- Autónomos pero coordinados vía **LangGraph.js**.
- Independientes pero colaborativos bajo una jerarquía estricta.
- Capaces de tomar decisiones, delegar y aprender vía **Engram**.

**Jerarquía Actualizada:**
0.  **Agente Mirror (Aduana):** Entrada oficial del grafo. Refina la intención y valida con el humano.
1.  **Agente CEO (Estratega):** Orquestador dinámico. Elige el Chief adecuado (Software o Business).
2.  **Agentes Chief:** Coordinan áreas.
    *   **Software Chief:** Ingeniería, arquitectura y tests.
    *   **Business Chief:** Lead gen, mercado y crecimiento. ✅ Fase A Completada.
3.  **Agentes Workers:** Ejecutan tareas atómicas (Git, Researcher, TestRunner, AI-Engine Worker, Persistence Worker).

---

## --- Fase B: Interfaz y Control (En Progreso) ---
- **Control Panel:** UI en Next.js 15 (React 19 RC) con Tailwind CSS y shadcn/ui. ✅
- **HITL Gateways:** Interrupciones de seguridad para aprobación humana. 🚧
- **Live Streaming:** Visualización del razonamiento vía SSE. 🚧

---

## --- Convenciones de Ingeniería (Leyes Sagradas) ---

1.  **SRP & DRY:** Cada componente hace una cosa. Lógica común en `/helpers`.
2.  **Barrel Files:** Obligatorio usar `index.ts` para exportar nodos y tipos.
3.  **Tipado Estricto (No Any):** Prohibido el uso de `any` en código productivo. Solo se permite en mocks de tests bajo `eslint-disable`.
4.  **Structured Outputs:** Obligatorio usar `llm.withStructuredOutput(schema)`.
5.  **UI Standards:** Uso obligatorio de **Tailwind CSS** y **shadcn/ui**. Prohibido el CSS inline.
6.  **Memoria Permanente:** Toda decisión estratégica debe persistirse en Engram.

### --- Nuevas Leyes de Autonomía y Seguridad (v2.0) ---

7.  **Idempotencia Obligatoria:** Todo Worker debe ser diseñado para que, si se ejecuta dos veces con el mismo input, el resultado sea el mismo sin duplicar archivos o estados (Ej: chequear si una branch existe antes de crearla).
8.  **Reasoning-First:** Prohibido ejecutar una acción técnica (Command/Tool) sin haber guardado antes en el estado un campo `reasoning` que explique el "por qué" de la decisión.
9.  **Autocorrección Inmediata:** Después de cada cambio (escritura de archivo o comando), el agente debe verificar el resultado al instante. Si hay un error, debe intentar arreglarlo antes de devolver el control al Chief.

---

## --- Estructura del Proyecto (Versión 2026 - Optimizada) ---

```text
/
├── /.github
│   ├── /ISSUE_TEMPLATE
│   ├── /workflows
├── .gitignore
├── .opencodeignore.save
├── /.qwen
│   ├── settings.json
├── /.vscode
│   ├── extensions.json
├── /.windsurf
│   ├── /workflows
├── AGENTS.md
├── GEMINI.md
├── README.md
├── /ai-engine
│   ├── /.pytest_cache
│   │   ├── /v
│   ├── /.venv
│   │   ├── /bin
│   │   ├── /include
│   │   ├── /lib
│   ├── /app
│   │   ├── /__pycache__
│   │   ├── /api
│   │   ├── /contracts
│   │   ├── /core
│   │   ├── /grpc_generated
│   │   ├── /helpers
│   │   ├── /tools
│   │   ├── /workers
│   ├── package.json
│   ├── /scripts
│   ├── /tests
├── architecture.md
├── /backend
│   ├── package.json
│   ├── /src
│   │   ├── /agents
│   │   ├── /contracts
│   │   ├── /controllers
│   │   ├── /db
│   │   ├── /graph
│   │   ├── /helpers
│   │   ├── index.ts
│   │   ├── /jobs
│   │   ├── /mcp_ports
│   │   ├── /middleware
│   │   ├── /nodes
│   │   ├── /routes
│   │   ├── /services
│   │   ├── /skills
│   │   ├── /state
│   │   ├── test-business-workflow.ts
│   │   ├── test-persistence.ts
│   │   ├── test-run.ts
│   │   ├── test-workflow.ts
│   │   ├── /tools
│   │   ├── /types
│   │   ├── /workers
│   ├── /tests
│   │   ├── business_chief.test.ts
│   │   ├── ceo_agent.test.ts
│   │   ├── code_researcher.test.ts
│   │   ├── concurrency_manual.ts
│   │   ├── context_manager.test.ts
│   │   ├── git_worker.test.ts
│   │   ├── llm_factory.test.ts
│   │   ├── mirror_node.test.ts
│   │   ├── software_chief.test.ts
│   │   ├── test_runner_node.test.ts
│   ├── tsconfig.json
├── commitlint.config.js
├── /docs
│   ├── /agents
│   │   ├── /chiefs
│   │   ├── /workers
│   ├── /architecture
│   ├── /memory
│   │   ├── /PARA
│   │   │   ├── /projects
│   │   │   │   ├── /startup-autonoma
│   ├── /ux
├── /frontend
│   ├── .eslintrc.json
│   ├── components.json
│   ├── next-env.d.ts
│   ├── package-lock.json
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
├── /protos
├── /scripts
├── /skills
├── tsconfig.json
├── turbo.json
├── /types
│   ├── index.ts
```

---

## --- Automatización y Calidad ---

- **Conventional Commits:** `tipo(scope): mensaje`. Evaluado por Husky.
- **Pipeline Local:** `pre-commit` (Sync Arch + Check + Test) y `pre-push` (Lint + Full Check). 
- **Comunicación:** gRPC de alta performance.
