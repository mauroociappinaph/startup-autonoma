# Engram Strategy: The Organizational Brain

Este documento define cómo la startup utiliza Engram para la persistencia semántica de largo plazo. La memoria operativa vive en LangGraph, pero la sabiduría organizacional vive en Engram.

## Estructura de Memoria (PARA Method)

Utilizaremos las carpetas de Engram siguiendo el método PARA para organizar el conocimiento:

- **Projects:** Memorias específicas de una tarea o feature actual. (Ej: "Refactor de Auth").
- **Areas:** Conocimiento persistente por departamento. (Ej: `areas/software`, `areas/business`).
- **Resources:** Documentación externa, snippets de código útiles y benchmarks.
- **Archives:** Decisiones de proyectos terminados que ya no están activos.

## Triggers de Aprendizaje (Cuándo llamar a `mem_save`)

Los agentes deben persistir información en Engram cuando ocurra lo siguiente:

1.  **Decisión Estratégica (CEO):** Se elige un stack tecnológico o un cambio de rumbo en el negocio.
2.  **Aprobación de Estilo (Mirror):** El usuario aprueba un prompt optimizado (se guarda la preferencia de tono).
3.  **Root Cause Found (Chief):** Se descubre por qué fallaba un Worker y cómo se arregló.
4.  **Insight de Mercado (Chief):** Se detecta un nuevo competidor o una tendencia clara.

## Protocolo de Búsqueda (Cuándo llamar a `mem_search`)

Antes de iniciar una fase, el agente responsable debe:
1.  Buscar precedentes: `mem_search(query="tareas similares a X")`.
2.  Inyectar el contexto recuperado en su prompt para evitar errores pasados.

## Topic Keys Estándar

Para facilitar la recuperación, usaremos keys consistentes:
- `user/preferences/*`: Gustos y estilos del usuario.
- `tech/decisions/*`: Arquitectura y ADRs.
- `market/insights/*`: Inteligencia de negocio.
- `ops/conventions/*`: Reglas de nombrado, git, etc.

## Beneficios
- **Onboarding de nuevos agentes:** Un nuevo agente puede "leer" la historia de la empresa vía Engram.
- **Consistencia:** El sistema no te pregunta dos veces lo mismo si ya lo definiste una vez.
