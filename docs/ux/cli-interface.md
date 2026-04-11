# CLI Interface: User-Agent Interaction

La CLI es el punto de contacto único entre el usuario humano y la startup autónoma. El objetivo es una interfaz mínima, informativa y que permita el control total sin microgestión.

## Patrones de Interacción

1.  **Modo Introspectivo (Mirror):**
    - El usuario escribe un comando.
    - La CLI responde: *"Interpreté que querés hacer X. ¿Es correcto? (S/N/Ajustar)"*.
2.  **Streaming de Pensamiento:**
    - Mientras los agentes trabajan, la CLI muestra quién tiene el mando:
      - `[CEO] Planificando hito 1...`
      - `[SoftwareChief] Desglosando tickets para GitWorker...`
      - `[GitWorker] Escribiendo lógica en branch feature/auth...`
3.  **Human-in-the-loop (Checkpoints):**
    - En puntos críticos (ej: antes de un merge a master o antes de gastar presupuesto en ads), el sistema se pausa y solicita aprobación explícita.

## Comandos Imaginados (Futuros)

- `startup "creame un microservicio de clima en Go"`: Inicia el flujo completo.
- `startup status`: Muestra el estado actual del grafo y quién está trabajando.
- `startup history`: Consulta a Engram sobre decisiones pasadas.
- `startup pause / resume`: Gestiona los checkpoints de LangGraph.

## Visualización del Estado
La CLI debe utilizar colores y símbolos para diferenciar los niveles jerárquicos:
- 🏢 **[CEO]**: Azul (Estrategia)
- 👨‍💼 **[Chief]**: Amarillo (Coordinación)
- 🛠️ **[Worker]**: Verde (Ejecución)
- ⚠️ **[System]**: Rojo (Errores/Bloqueos)

## Principios de UX
- **No Verbosity:** Mostrar solo lo esencial. Si el usuario quiere ver el log completo, usa un flag `--verbose`.
- **Accionabilidad:** Cada pausa debe indicar claramente qué decisión necesita del humano.
