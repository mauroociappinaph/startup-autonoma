import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { EngramToolArgs } from "@/types/engram.types.js";
import { EngramPort } from "@/mcp_ports/engramPort.js";

/**
 * Tool: save_to_engram
 * Permite a los agentes persistir conocimiento organizacional.
 */
export const save_to_engram = tool(
  async (args: EngramToolArgs) => {
    return await EngramPort.save(args);
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
