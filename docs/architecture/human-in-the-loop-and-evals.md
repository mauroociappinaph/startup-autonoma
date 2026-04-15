# 🛑 Human-in-the-loop (HITL) y Agentic Evals

Para que nuestra Startup Autónoma no mute a un Skynet descontrolado que gaste presupuesto y contacte usuarios de manera errática, LangGraph queda gobernado por dos protocolos de seguridad extrema:

## 1. Human-in-the-Loop (HITL)
El "Human-in-the-loop" es nuestro freno de emergencia y nuestra válvula de desvío. No todos los agentes pueden finalizar transacciones irreversiblemente.

### Rutas Críticas Limitadas (`interrupt_before`)
Cuando el LangGraph orquestado por el CEO detecta que el siguiente nodo (`node.ts`) va a ejecutar una acción de Nivel Rojo, el flujo de ejecución se **pausa en memoria**.
- Ejemplos de Nivel Rojo: Cobrar a una tarjeta de crédito, enviar emails masivos a bases de leads, desplegar infraestructura en AWS.
- El servidor Node vía **Server-Sent Events (SSE)** le notifica al Frontend Next.js del humano: _"🛑 El agente X quiere autorización para enviar la campaña"_.
- El grafo se despierta y continúa únicamente si el endpoint de LangGraph recibe un *Resume Command* disparado manualmente por nosotros.

## 2. Agentic Evals (LLM-as-a-Judge)
Mientras [el Software Chief y el CLI de la Terminal validad por TDD los bloques de código](/AGENTS.md), ¿quién testea los "textos y decisiones"? Un test unitario (`expect(string).toBe`) no sirve para probar si un agente está alucinando o fue grosero.

### El Juzgado (`/backend/src/evals/`)
Se inyecta un framework secundario asíncrono.
1. Cuando un `LeadGen Worker` escribe un email frío de ventas, pasa el output al Eval.
2. Un Modelo Perfilador (ej. Groq - Llama3 configurado como Evaluador Ciego) verifica:
   - *¿Cumple las reglas de tono?* (Aprobado/Desaprobado).
   - *¿Alucinó datos irreales?* (Sí/No).
3. Si el Juez lo reprueba, el error se revuelve al trabajador original (`retry`) en un ciclo controlado antes de pisar el mundo real. Funciona a modo de Unit Test, pero para el mundo semántico.
