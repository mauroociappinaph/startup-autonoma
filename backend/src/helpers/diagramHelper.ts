import { BaseMessage, AIMessage } from "@langchain/core/messages";

/**
 * Mapeo de nombres técnicos a nombres descriptivos para el diagrama.
 */
const NODE_NAMES: Record<string, string> = {
  aduana_sentinel: "Aduana",
  ceo: "CEO",
  software_chief: "Software Chief",
  business_chief: "Business Chief",
  operations_chief: "Operations Chief",
  operations_worker: "Operations Worker",
  git_worker: "Git Worker",
  test_runner: "Test Runner",
  ai_engine_worker: "AI Engine",
  persistence_worker: "Persistence",
  researcher: "Researcher",
  code_writer: "Code Writer"
};

/**
 * Genera un diagrama de secuencia Mermaid a partir del historial de mensajes.
 * @param messages Historial de mensajes del estado.
 * @returns String con el diagrama en formato Mermaid.
 */
export function generateSequenceDiagram(messages: BaseMessage[]): string {
  if (!messages || messages.length === 0) return "";

  let diagram = "sequenceDiagram\n    autonumber\n";
  let lastNode = "Humano";

  for (const msg of messages) {
    if (msg instanceof AIMessage) {
      const nodeKey = (msg.additional_kwargs?.node as string) || "desconocido";
      const nodeName = NODE_NAMES[nodeKey] || nodeKey;
      
      // Limpiar el contenido para el diagrama (extraer solo lo relevante)
      let content = msg.content.toString();
      content = content.replace(/\[.*?\]/g, "").trim(); // Quitar tags como [CEO_THOUGHT]
      content = content.split("\n")[0]; // Solo la primera línea para no saturar
      if (content.length > 50) content = content.substring(0, 47) + "...";

      if (nodeName !== lastNode) {
        diagram += `    ${lastNode}->>+${nodeName}: ${content || "Procesando..."}\n`;
        lastNode = nodeName;
      }
    } else if (msg.getType() === "human") {
        lastNode = "Humano";
    }
  }

  return diagram;
}
