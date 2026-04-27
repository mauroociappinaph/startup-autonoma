# Reasoning: Sequential Thinking Specification

## Purpose
Define el comportamiento de la herramienta de pensamiento secuencial para permitir a los agentes realizar Chain of Thought (CoT) de manera estructurada y persistente dentro del grafo de ejecución.

## Requirements

### Requirement: Estructura del Pensamiento
La herramienta MUST permitir a los agentes registrar sus pasos de pensamiento de forma secuencial.

#### Scenario: Registro de Paso Inicial
- GIVEN un agente que comienza a analizar un problema.
- WHEN invoca `sequential_thinking` con `thought="Analizando el impacto en la DB"`, `step=1`, `total_steps=3`.
- THEN la herramienta MUST devolver el contenido del pensamiento para ser incluido en el historial del grafo.

#### Scenario: Revisión de Pensamiento Anterior
- GIVEN un agente que descubre un error en su razonamiento previo.
- WHEN invoca `sequential_thinking` con `is_revision=true` y `revises_step=1`.
- THEN la herramienta MUST marcar el nuevo pensamiento como una corrección del paso especificado.

### Requirement: Discovery y Categorización
La herramienta MUST estar integrada en el sistema de Discovery del backend.

#### Scenario: Obtención por Categoría
- GIVEN el sistema de orquestación buscando herramientas de razonamiento.
- WHEN solicita herramientas de la categoría `reasoning` al `ToolRegistry`.
- THEN la herramienta `sequential_thinking` MUST ser devuelta en la lista.

### Requirement: Resiliencia y Performance
Al ser una herramienta nativa (no externa), la ejecución MUST ser inmediata y síncrona.

#### Scenario: Ejecución sin Latencia
- GIVEN un agente en un bucle de razonamiento crítico.
- WHEN invoca la herramienta.
- THEN la respuesta MUST ser devuelta sin esperas de red ni timeouts de MCP.
