# Knowledge Retrieval Strategy: Structured RAG with Engram

Este documento define cómo los agentes recuperan información de la memoria de largo plazo para evitar alucinaciones y reutilizar el conocimiento organizacional.

## El Concepto: RAG Estructurado

En lugar de una búsqueda vectorial ciega, implementamos un sistema de **Recuperación con Intención**. Los agentes no solo buscan "lo que se parece", sino que filtran por contexto y relevancia jerárquica.

## Niveles de Recuperación

### 1. Contexto Directo (Hot Memory)
- **Fuente:** `StartupState` de LangGraph.
- **Uso:** Información necesaria para la tarea inmediata (ej: el prompt actual, resultados de workers anteriores).
- **Acceso:** Directo vía variables de estado.

### 2. Reglas del Sistema (Warm Memory)
- **Fuente:** Archivos Markdown en `@docs/**`.
- **Uso:** Definición de roles, protocolos de comunicación y estándares de código.
- **Acceso:** Los agentes leen estos archivos al inicializarse o cuando el CEO lo requiere.

### 3. Memoria Semántica (Cold Memory - RAG)
- **Fuente:** **Engram**.
- **Uso:** Decisiones pasadas, preferencias del usuario, resolución de bugs históricos.
- **Acceso:** Vía `mem_search` con filtrado por Topic Keys.

## Protocolo de Búsqueda para Agentes

Para garantizar eficiencia, los agentes deben seguir este flujo de recuperación:

1.  **Definir la Intención:** ¿Busco una decisión técnica, una preferencia del usuario o un snippet de código?
2.  **Filtrado por Topic Key:**
    - Si busca preferencias -> `mem_search(query="...", topic="user/preferences")`
    - Si busca arquitectura -> `mem_search(query="...", topic="tech/decisions")`
3.  **Inyección con Privilegio Mínimo (Least Privilege):** El agente orquestador CORTA el exceso de ruido. Debe tomar los registros crudos devueltos por `mem_search` y resumirlos en 2 o 3 directivas puntuales. Se prohíbe volcar el objeto entero de la memoria al prompt del Worker (previene el costo masivo de tokens y el "Lost in the Middle"). La inyección entra bajo el pre-prompt `[CONTEXTO RESUMIDO RECUPERADO]`.

## Triggers de Actualización (Feedback Loop)

El sistema de recuperación se retroalimenta:
- Si un agente recupera información y el usuario la marca como "irrelevante", el agente debe guardar un "Learned" en Engram indicando por qué esa información no sirvió para esa tarea específica.

## Ventajas sobre Vector DBs Tradicionales
- **Menor Ruido:** El uso de Topic Keys actúa como un filtro de primera capa antes de la búsqueda vectorial.
- **Auditabilidad:** Es fácil rastrear por qué un agente tomó una decisión basándose en la memoria recuperada.
- **Costo de Tokens:** Solo se recupera e inyecta lo estrictamente necesario.
