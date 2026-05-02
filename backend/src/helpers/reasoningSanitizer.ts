/**
 * Helper para asegurar el cumplimiento de la Ley #53 (Strict-XML-Formatting).
 * Valida y formatea el campo `reasoning` devuelto por los LLMs para asegurar
 * la presencia de los tags <thought>, <plan> y <action>.
 */
export class ReasoningSanitizer {
  /**
   * Sanitiza un string de razonamiento garantizando que contenga los tags obligatorios.
   * Si falta alguno, lo inyecta vacío o envuelve el texto libre.
   * 
   * @param reasoning String bruto devuelto por el LLM.
   * @returns String sanitizado que cumple con la Ley #53.
   */
  static sanitize(reasoning: string | undefined | null): string {
    if (!reasoning) {
      return "<thought></thought>\n<plan></plan>\n<action></action>";
    }

    let sanitized = reasoning.trim();

    // Si no contiene ninguno de los tags, asumimos que todo el texto es un 'thought'
    if (!sanitized.includes("<thought>") && !sanitized.includes("<plan>") && !sanitized.includes("<action>")) {
      sanitized = `<thought>\n${sanitized}\n</thought>`;
    }

    // Parchear tags faltantes asegurando un orden lógico si es posible, 
    // pero lo básico es que existan para no romper el parser del frontend.
    if (!sanitized.includes("<thought>")) {
      sanitized = `<thought></thought>\n${sanitized}`;
    }
    if (!sanitized.includes("<plan>")) {
      sanitized += "\n<plan></plan>";
    }
    if (!sanitized.includes("<action>")) {
      sanitized += "\n<action></action>";
    }

    return sanitized;
  }
}
