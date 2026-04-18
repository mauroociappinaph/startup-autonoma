/**
 * Configuración de Precios de Tokens (USD por 1,000,000 de tokens).
 * Basado en las tarifas de mercado de Abril 2026.
 */
export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  // OpenAI
  "gpt-4o": { input: 5.0, output: 15.0 },
  "gpt-4o-mini": { input: 0.15, output: 0.60 },

  // Anthropic
  "claude-3-5-sonnet-20240620": { input: 3.0, output: 15.0 },

  // Google
  "gemini-1.5-pro": { input: 3.50, output: 10.50 },
  "gemini-1.5-flash": { input: 0.075, output: 0.30 },

  // Groq / NVIDIA (Precios promedio de proveedores de hosting)
  "llama-3.1-70b-versatile": { input: 0.59, output: 0.79 },
  "nvidia/nemotron-4-340b-instruct": { input: 0.60, output: 1.20 },
  "nvidia/llama-3.1-8b-instruct": { input: 0.10, output: 0.10 },

  // Default (si el modelo no está en la lista)
  "default": { input: 1.0, output: 1.0 },
};
