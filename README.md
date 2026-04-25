# Startup Autónoma

> Ecosistema de agentes jerárquicos capaz de crear software, prospectar clientes y tomar decisiones de negocio de forma autónoma. Construido sobre LangGraph.js, gRPC y Next.js 15.

[![CI](https://github.com/mauroociappinaph/startup-autonoma/actions/workflows/ci.yml/badge.svg)](https://github.com/mauroociappinaph/startup-autonoma/actions/workflows/ci.yml)
[![Tests](https://github.com/mauroociappinaph/startup-autonoma/actions/workflows/test.yml/badge.svg)](https://github.com/mauroociappinaph/startup-autonoma/actions/workflows/test.yml)

---

## ¿Qué es esto?

Un **monorepo (Turborepo)** que implementa una startup operada por agentes de IA en producción. El sistema puede:

- 🧠 **Razonar y delegar** — El CEO analiza la misión y elige el Chief correcto (Software o Business)
- 💻 **Crear software** — El Software Chief dirige a workers de Git, Tests y Research
- 📈 **Hacer negocio** — El Business Chief genera leads, analiza mercados y persiste aprendizajes
- 🛡️ **Protegerse solo** — El Circuit Breaker monitorea tokens e iteraciones en tiempo real
- 👁️ **Mostrarte todo** — La Mission Control (Next.js) visualiza el razonamiento en vivo

---

## Arquitectura

```
 HUMANO
   │
   ▼
[ Mirror (Aduana) ]  ← Refina la intención, valida con el humano
   │
   ▼
[ Circuit Breaker ]  ← Guardián: valida presupuesto (100k tokens) e iteraciones (20 pasos)
   │
   ▼
[ CEO (Estratega) ]  ← Orquestador dinámico. Elige el Chief según el dominio.
   │
   ├─── [ Software Chief ]
   │         ├── Git Worker       (branches, commits, PRs)
   │         ├── Test Runner      (jest, validación de calidad)
   │         ├── Researcher       (exploración del codebase)
   │         └── Code Researcher  (análisis semántico de código)
   │
   └─── [ Business Chief ]
             ├── AI Engine Worker  (gRPC → Python → Lead Gen, scraping)
             └── Persistence Node  (memoria semántica en Engram)
```

### Stack Tecnológico

| Capa | Tecnología | Responsabilidad |
|------|-----------|----------------|
| **Orquestación** | Node.js + LangGraph.js | Grafo de estados con HITL y checkpointing |
| **Motor de IA** | Python + FastAPI + gRPC | Razonamiento pesado, scraping, ML |
| **Interfaz** | Next.js 15 (App Router) | Mission Control en tiempo real via SSE |
| **Comunicación** | gRPC (Protocol Buffers) | Alta performance entre Backend y AI Engine |
| **Memoria** | Engram (método PARA) | Persistencia semántica de largo plazo |
| **Validación** | Zod (TS) + Pydantic (Py) | Contratos de datos estrictos en toda la pila |
| **Monorepo** | Turborepo | Build, test y lint paralelos entre paquetes |

---

## Inicio Rápido

### Requisitos

- **Node.js** v20+
- **Python** 3.10+
- Clave de API del proveedor LLM configurada en `.env`

### Instalación

```bash
# Clonar e instalar dependencias de todos los paquetes
git clone https://github.com/mauroociappinaph/startup-autonoma.git
cd startup-autonoma
npm install

# Instalar dependencias del frontend explícitamente (requerido por npm workspaces)
npm install --prefix frontend
```

### Variables de Entorno

Crear un `.env` en la raíz con:

```env
# Proveedor LLM (Anthropic, OpenAI, Google, etc.)
ANTHROPIC_API_KEY=sk-...

# Engram (memoria semántica)
ENGRAM_API_KEY=...

# Puertos de servicios
BACKEND_PORT=4000
AI_ENGINE_PORT=50051
```

### Desarrollo

```bash
# Levantar todos los servicios en simultáneo
npm run dev

# O individualmente
npm run dev:backend    # Node.js en :4000
npm run dev:frontend   # Next.js en :3000
npm run dev:ai         # FastAPI + gRPC en :50051
```

Abrí `http://localhost:3000` para acceder a la **Mission Control**.

---

## Mission Control (UI)

El dashboard en tiempo real incluye:

- **Orchestration Graph** — Visualización interactiva del grafo de agentes (React Flow)
- **Reasoning Feed** — Stream de pensamientos de los agentes en tiempo real (SSE)
- **Strategy Card** — Plan actual y pasos completados
- **Mission Telemetry** — Consumo de tokens e iteraciones en vivo vs. límites del Circuit Breaker
- **HITL Gateway** — Aprobación humana antes de ejecutar acciones críticas

---

## Resiliencia (Circuit Breaker)

El sistema implementa un nodo guardián que intercepta **cada transición** del grafo:

```typescript
const MAX_TOKENS = 100_000;   // Presupuesto máximo por misión
const MAX_ITERATIONS = 20;    // Pasos máximos para evitar bucles infinitos
```

Si se superan los límites, el guardián interrumpe el grafo limpiamente y reporta el motivo. El consumo se transmite via SSE al dashboard en tiempo real.

---

## Calidad y Automatización

### Pipeline Local (Husky)

| Hook | Qué valida |
|------|-----------|
| `pre-commit` | TSC (tipado), arquitectura SRP, estructura del proyecto |
| `pre-push` | Lint completo (ESLint, --max-warnings=0), tests unitarios |

### Comandos

```bash
npm run test        # Tests unitarios (Jest en backend y frontend)
npm run lint        # ESLint en todos los paquetes
npm run check       # TypeScript (tsc --noEmit) en todos los paquetes
npm run sync-arch   # Regenera architecture.md desde la estructura real
npm run sync-docs   # Sincroniza AGENTS.md con la estructura del proyecto
```

### Conventional Commits

Todos los commits siguen el estándar `tipo(scope): mensaje`. El hook de commit-msg lo valida automáticamente.

---

## Leyes Sagradas

Este repositorio opera bajo una constitución técnica estricta. Las leyes fundamentales:

1. **SRP & DRY** — Cada componente hace una cosa. Lógica común en `/helpers`.
2. **Barrel Files** — Obligatorio usar `index.ts` para exportar nodos y tipos.
3. **No Any** — Prohibido el uso de `any` en código productivo.
4. **Structured Outputs** — Obligatorio usar `llm.withStructuredOutput(schema)`.
5. **Idempotencia** — Todo Worker debe ser idempotente (verificar antes de actuar).
6. **Reasoning-First** — Prohibido ejecutar una acción sin antes registrar el `reasoning` en el estado.
7. **Autocorrección** — Después de cada cambio, el agente verifica el resultado y corrige errores antes de devolver el control.

**Lee [AGENTS.md](./AGENTS.md) para la documentación completa de cada ley y la hoja de ruta.**

---

## Roadmap

| Fase | Estado | Descripción |
|------|--------|-------------|
| **Fase A** | ✅ Completa | Business Chief, Lead Gen Worker (gRPC), Persistence Loop |
| **Fase B** | ✅ Completa | Mission Control UI, Circuit Breaker, Live Streaming & **State Rewind (Time-Travel)** |
| **Fase C** | 🚧 En Proceso | **Infraestructura y Operaciones**: Dockerization, Operations Chief e Inmortalidad del Grafo |
| **Fase D** | 🔜 Planeada | Persistencia de Proyectos + Multi-tenant |


---

*Construido con obsesión por la arquitectura limpia y la autonomía real.*
