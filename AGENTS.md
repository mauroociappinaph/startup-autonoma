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

## --- Estructura del Proyecto (Versión 2026 - Fase B) ---

```text
/
├── AGENTS.md
├── /ai-engine            # Python (Cerebro IA) ✅ Fase A OK
├── /backend              # Node.js (Orquestador) ✅ Fase A OK
│   ├── /src/nodes        # Nodos del grafo (CEO, Mirror, Chiefs)
│   ├── /src/graph        # Lógica de LangGraph
│   ├── /src/tools        # Herramientas de dominio y plataforma
├── /frontend             # UI Control Panel (Next.js 15) 🚧 Fase B
│   ├── /src/app          # App Router (Dashboard, Layout)
│   ├── /src/components/ui# Shadcn/UI (Card, Button, Badge)
│   ├── /src/helpers      # Utils (cn, SSE hooks)
├── /docs                 # Documentación viva
├── /protos               # Contratos gRPC
```

---

## --- Convenciones de Ingeniería (Leyes Sagradas) ---

1.  **SRP & DRY:** Cada componente hace una cosa. Lógica común en `/helpers`.
2.  **Barrel Files:** Obligatorio usar `index.ts` para exportar nodos y tipos.
3.  **Tipado Estricto (No Any):** Prohibido el uso de `any` en código productivo. Solo se permite en mocks de tests bajo `eslint-disable`.
4.  **Structured Outputs:** Obligatorio usar `llm.withStructuredOutput(schema)`.
5.  **UI Standards:** Uso obligatorio de **Tailwind CSS** y **shadcn/ui**. Prohibido el CSS inline o estilos fuera del sistema de diseño.
6.  **Memoria Permanente:** Toda decisión estratégica debe persistirse en Engram.

---

## --- Automatización y Calidad ---

- **Conventional Commits:** `tipo(scope): mensaje`. Evaluado por Husky.
- **Pipeline Local:** `pre-commit` (Check + Test) y `pre-push` (Lint + Full Check).
- **Frontend Stack:** Next.js 15, React 19, Lucide Icons, Radix UI.
