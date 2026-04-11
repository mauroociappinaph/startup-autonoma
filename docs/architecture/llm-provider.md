# 🧠 Estrategia de Inyección y Resiliencia de LLMs

En la Startup Autónoma, los Large Language Models (LLMs) son el motor cognitivo, pero también **el punto único de falla (SPOF) más grande y costoso**. 
Para evitar acoplamiento y roturas en cascada, implementamos un ecosistema desacoplado bajo el patrón **Factory & Service (Leyes #6, #7, #13 y #14)**.

## 1. El Patrón LLM Factory (`/backend/src/services/llmFactory.ts`)
**REGLA:** Ningún Nodo tiene permitido importar SDKs de proveedores de forma directa.
- Todas las instancias de LLMs nacen en el `LLMFactory`.
- El sistema utiliza perfiles de inteligencia: **SMART** (Razonamiento complejo) y **FAST** (Tareas atómicas).
- El ruteo se configura vía variables de entorno (`PRIMARY_SMART_PROVIDER`, `PRIMARY_FAST_PROVIDER`).

## 2. LLM Service: La Capa de Blindaje
El `LLMService` es el punto de entrada oficial para los agentes. Empaqueta el modelo de la Factory con dos protecciones obligatorias:
- **Trimming de Contexto (Ley #13):** Invoca al `ContextManager` para recortar el historial de mensajes antes de enviarlo al modelo, protegiendo la ventana de tokens y los costos.
- **Structured Outputs (Ley #14):** Utiliza `.withStructuredOutput(zodSchema)` para garantizar que la respuesta sea un objeto JS válido, eliminando el riesgo de errores de parseo por alucinaciones verborrágicas del LLM.

## 3. Manejo de Fallback
El sistema está diseñado para conmutar entre proveedores (OpenAI, Anthropic, Google, Groq) de forma transparente. Si un proveedor cae o alcanza límites de tasa, el cambio de estrategia se centraliza en el `LLMFactory` sin afectar la lógica de negocio de los agentes.

## 4. Configuraciones Soportadas
| Perfil | Proveedor Recomendado | Modelo |
| :--- | :--- | :--- |
| **SMART** | OpenAI / Anthropic | GPT-4o / Claude 3.5 Sonnet |
| **FAST** | Groq / OpenAI | Llama 3.1 70b / GPT-4o-mini |
