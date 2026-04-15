# LLM Providers & Routing Strategy

## Overview
El sistema emplea un enfoque multi-proveedor para optimizar costos, latencia y capacidades de razonamiento. La `LLMFactory` actúa como el orquestador de modelos, abstrayendo la complejidad de las APIs de los proveedores.

## Supported Providers
| Proveedor | Capacidad Sugerida | Notas |
|-----------|--------------------|-------|
| **OpenAI** | Smart / Fast | Estándar de oro en razonamiento y JSON nativo. |
| **Anthropic** | Smart | Excelente para análisis de código complejo. |
| **Groq** | Fast | Latencia ultra-baja para tareas atómicas. |
| **NVIDIA NIM** | Smart (Nemotron) | Alta performance y precisión técnica. Requiere `Manual Fallback`. |
| **Google** | Smart / Fast | Integración nativa con herramientas de Vertex AI. |

## Smart vs Fast Routing
El sistema divide las tareas en dos categorías:
1.  **Smart Tasks**: Orquestación (CEO), Diseño Arquitectónico y Análisis Crítico. Utiliza modelos como `Nemotron-3-Super` o `GPT-4o`.
2.  **Fast Tasks**: Ejecución de herramientas (Workers), validación de sintaxis y resúmenes simples. Utiliza modelos como `Llama-3-70b` (Groq) o `GPT-4o-mini`.

## Resilient Structured Output Pattern
Debido a inconsistencias en la implementación del protocolo `response_format` de OpenAI por parte de proveedores compatibles (principalmente NVIDIA NIM), hemos implementado un patrón de resiliencia en `LLMService`:

1.  **Native Attempt**: Intenta usar `withStructuredOutput(zodSchema)`.
2.  **Compatibility Detection**: Si el proveedor es detectado como incompatible (ej: `nvidia`), salta al fallback.
3.  **Manual Fallback**: 
    - Emplea `StructuredOutputParser.fromZodSchema(schema)`.
    - Inyecta instrucciones imperativas de formato al final del prompt.
    - Parsea manualmente la salida utilizando lógica de extracción de JSON segura.

## Environment Configuration
La configuración se gestiona en `backend/.env`:
```env
PRIMARY_SMART_PROVIDER=nvidia
NVIDIA_SMART_MODEL=nvidia/nemotron-3-super-120b-a12b
PRIMARY_FAST_PROVIDER=groq
GROQ_FAST_MODEL=llama3-70b-8192
```
