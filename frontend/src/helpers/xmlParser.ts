/**
 * Helper para extraer contenido de tags XML en el frontend.
 * Utilizado para procesar el razonamiento estructurado de los agentes.
 */
export function extractTag(text: string, tag: string): string | undefined {
  if (!text) return undefined;
  
  // 1. Intentamos match completo (con tag de cierre)
  const fullRegex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i");
  const fullMatch = text.match(fullRegex);
  if (fullMatch) return fullMatch[1].trim();

  // 2. Si no hay tag de cierre, buscamos si el tag de apertura existe
  const openRegex = new RegExp(`<${tag}>([\\s\\S]*)`, "i");
  const openMatch = text.match(openRegex);
  
  // Si encontramos el tag de apertura, devolvemos lo que haya después (streaming)
  return openMatch ? openMatch[1].trim() : undefined;
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
