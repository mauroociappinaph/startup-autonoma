/**
 * Helper para extraer contenido de tags XML en el frontend.
 * Utilizado para procesar el razonamiento estructurado de los agentes.
 */
export function extractTag(text: string, tag: string): string | undefined {
  if (!text) return undefined;
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)(?:</${tag}>|$)`, "i");
  const match = text.match(regex);
  return match ? match[1].trim() : undefined;
}

/**
 * Parsea un pensamiento completo buscando los bloques CoT estándar.
 */
export function parseAgentThought(text: string) {
  return {
    thought: extractTag(text, "thought"),
    plan: extractTag(text, "plan"),
    verification: extractTag(text, "verification"),
    action: extractTag(text, "action"),
  };
}
