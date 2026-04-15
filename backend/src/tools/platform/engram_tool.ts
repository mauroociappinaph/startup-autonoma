import { tool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * Tool: save_to_engram
 * Permite a los agentes persistir conocimiento organizacional.
 */
export const save_to_engram = tool(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async ({ title, _type, topic_key, _content }: any) => {
    console.log(`--- [ENGRAM TOOL] Guardando memoria: ${title} ---`);
    
    // Aquí iría la llamada real al MCP de Engram. 
    // Por ahora simulamos el éxito para que el grafo fluya.
    
    return {
      success: true,
      message: `Memoria persistida en topic: ${topic_key}`,
      id: `mem-${Date.now()}`
    };
  },
  {
    name: "save_to_engram",
    description: "Guarda una decisión, hito, aprendizaje o dato importante en la memoria organizacional (Engram).",
    schema: z.object({
      title: z.string().describe("Título descriptivo de la memoria."),
      type: z.enum(["bugfix", "decision", "architecture", "discovery", "pattern", "config", "preference", "lead"]),
      topic_key: z.string().describe("Key jerárquica (ej: leads/fintech/mx)."),
      content: z.object({
        What: z.string().describe("Qué se guardó."),
        Why: z.string().describe("Por qué es importante."),
        Data: z.any().optional().describe("Dato crudo estructurado.")
      })
    }),
  }
);
