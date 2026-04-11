# 🧠 Estrategia de Inyección y Resiliencia de LLMs

En la Startup Autónoma, los Large Language Models (LLMs) son el motor cognitivo, pero también **el punto único de falla (SPOF) más grande y costoso**.
Para evitar acoplamiento y roturas en cascada, implementamos un ecosistema desacoplado bajo el patrón **Factory & Router**.

## 1. El Patrón LLM Factory (`/backend/src/servicios/llmFactory.ts`)
**REGLA:** Ningún Nodo (ej: `ceo.ts`, `gitWorker.ts`) tiene permitido importar el SDK de Groq, OpenAI o LangChain Chat Models de forma directa.
- Todas las instancias de LLMs nacen en el `llmFactory`.
- El nodo solicita el perfil de inteligencia que necesita: `const llm = LLMFactory.getPerformer('coding')`.
- Si `Groq` cambia su API o nos banean la cuenta, la migración a Mistral o local (Ollama) ocurre exclusivamente editando un solo archivo: el `llmFactory`. Los nodos son agnósticos al proveedor.

## 2. El LLM Router Inteligente
Se prohíbe usar "balas de cañón para matar mosquitos". La orquestación debe solicitar modelos según el peso de la tarea:
- **Tareas Ligeras (Routing, Parseo Rápido, Análisis de Sentiment):** Modelos ultra-rápidos y baratos (ej. Llama-3-8B vía Groq). 
- **Tareas Pesadas (Arquitectura, Coding Deep, TDD):** Modelos de altísimo razonamiento (ej. Mistral Large, DeepSeek, etc).

## 3. Manejo de Caídas: Retry & Fallback
Las APIs gratuitas tienden al Rate-Limit (HTTP 429) excesivo.
- **Tolerancia Corta:** Todo LLM instanciado debe tener configurado internamente un `Retry Strategy`. Si hay micro-cortes, el sistema frena hilo y reintenta 3 veces con *Exponencial Backoff*.
- **Fallback Automático:** Si el proveedor primario falla (ej: Groq cae globalmente), el envoltorio del LLM intercepta el Error y **conmuta transparente y automáticamente** a nuestro proveedor secundario (Fallback Model) sin crashear el estado de LangGraph ni escupir el error al usuario final.
