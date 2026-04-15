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
    *   **Business Chief:** Lead gen, mercado y crecimiento.
3.  **Agentes Workers:** Ejecutan tareas atómicas (Git, Researcher, TestRunner, AI-Engine Worker).

---

## --- Estructura del Proyecto (Versión 2026) ---

```text
/
├── AGENTS.md
├── GEMINI.md
├── /ai-engine            # Python (Cerebro IA)
│   ├── /app/workers      # Lógica pesada (Scraping, Lead Gen)
│   ├── /grpc             # Contratos de comunicación
├── /backend              # Node.js (Orquestador)
│   ├── /src/graph        # Definición del flujo LangGraph
│   ├── /src/nodes/chiefs # Software y Business Chiefs
│   ├── /src/nodes/workers# Git, TestRunner, AI Engine
├── /docs                 # Documentación viva
├── /frontend             # UI Control Panel (Next.js 15)
├── /protos               # Definición gRPC universal
```

---

## --- Convenciones de Ingeniería (Leyes Sagradas) ---

1.  **SRP & DRY:** Cada componente hace una cosa. Lógica común en `/helpers`.
2.  **Barrel Files:** Obligatorio usar `index.ts` para exportar nodos y tipos.
3.  **Tipado Estricto (No Any):** Prohibido el uso de `any` en código productivo. Solo se permite en mocks de tests bajo `eslint-disable` explícito.
4.  **Structured Outputs:** Obligatorio usar `llm.withStructuredOutput(schema)` o el fallback de `LLMService` para garantizar integridad del estado.
5.  **Inversión de Dependencias:** Los nodos consumen LLMs a través de `LLMService/Factory`.
6.  **Memoria Permanente:** Toda decisión estratégica debe persistirse en Engram.

---

## --- Automatización y Calidad ---

- **Conventional Commits:** `tipo(scope): mensaje`. Evaluado por Husky.
- **Pipeline Local:** `pre-commit` (Check + Test) y `pre-push` (Lint + Full Check). Prohibido subir código con advertencias.
- **Comunicación:** gRPC para alta performance entre Node y Python.
