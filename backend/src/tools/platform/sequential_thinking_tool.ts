import { tool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * Esquema de validación para el pensamiento secuencial.
 */
export const SequentialThinkingSchema = z.object({
  thought: z.string().describe("El pensamiento detallado de este paso."),
  step: z.number().int().min(1).describe("El número de paso actual en la secuencia."),
  total_steps: z.number().int().min(1).describe("El total estimado de pasos para resolver la tarea."),
  is_revision: z.boolean().optional().describe("Si este paso revisa un razonamiento anterior."),
  revises_step: z.number().int().optional().describe("El número de paso que está siendo revisado.")
});

/**
 * Tool: sequential_thinking
 * Permite a los agentes realizar Chain of Thought (CoT) de manera estructurada.
 */
export const sequential_thinking = tool(
  async (args) => {
    const { thought, step, total_steps, is_revision, revises_step } = args;
    
    let prefix = `[Pensamiento ${step}/${total_steps}]`;
    if (is_revision) {
      prefix += ` (Revisión del paso ${revises_step})`;
    }
    
    return `${prefix}\n${thought}`;
  },
  {
    name: "sequential_thinking",
    description: "Desglosa problemas complejos en pasos de pensamiento secuencial. Úsala para planificar, analizar riesgos o corregir razonamientos previos.",
    schema: SequentialThinkingSchema,
  }
);
