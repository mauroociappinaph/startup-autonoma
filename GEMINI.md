# GEMINI.md

## Project Overview
La "Startup Autónoma" es un ecosistema de agentes jerárquicos diseñado para la creación y gestión automática de software y procesos de negocio. El sistema utiliza una arquitectura **monorepo (Turborepo)** para gestionar la lógica de orquestación, el motor de inteligencia artificial y la interfaz de usuario.

### Pilares Tecnológicos
- **Orquestación:** Node.js (backend) utilizando **LangGraph.js** para la lógica basada en grafos.
- **Motor de IA:** Python (ai-engine) con FastAPI para el razonamiento pesado, herramientas de ML y scraping.
- **Frontend:** Next.js 15 (App Router).
- **Comunicación:** gRPC para la comunicación de alta performance entre el Backend y el Motor de IA.
- **Persistencia Semántica:** Engram para la memoria de largo plazo (conocimiento organizacional).
- **Validación:** Zod para contratos de datos y tipado estricto en el ecosistema.

## Building and Running
El proyecto utiliza **Turborepo** para la gestión del monorepo. Desde la raíz, puedes usar los siguientes comandos:

- **Desarrollo:** `npm run dev` (ejecuta todos los servicios simultáneamente).
- **Desarrollo Backend:** `npm run dev:backend`.
- **Desarrollo Frontend:** `npm run dev:frontend`.
- **Desarrollo AI Engine:** `npm run dev:ai`.
- **Tests:** `npm run test`.
- **Build:** `npm run build`.
- **Validación de Código (Lint):** `npm run lint`.
- **Validación de Tipos (TSC):** `npm run check`.

## Development Conventions
- **SRP & DRY:** Cada componente tiene una única responsabilidad y se evita la duplicación de lógica.
- **Límites de Archivo:** Máximo 300 líneas por archivo.
- **Estructura:** Uso obligatorio de *barrel files* (`index.ts` o `__init__.py`) para exportaciones limpias.
- **Tipado Estricto:** TypeScript (Zod) en Backend/Frontend; Python (Pydantic/Type Hints) en AI Engine.
- **Documentación:** Obligatoria mediante JSDoc/Docstrings en toda lógica pública.
- **Calidad Local:** Pipeline basado en **Husky** (hooks `pre-commit` y `pre-push`) que bloquea envíos si no pasan tests o linters.
- **Jerarquía:** Operación basada en agentes CEO -> Chiefs -> Workers.
- **Persistencia:** Todo aprendizaje o decisión crítica debe persistirse en Engram utilizando topic keys consistentes.
