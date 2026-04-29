import { ISkill, SkillResponse } from "@/types/skills.types.js";
import { LLMService } from "@/services/llmService.js";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { z } from "zod";

/**
 * Clase base abstracta para implementar Expert Skills.
 * Proporciona utilidades para llamadas estructuradas al LLM.
 */
export abstract class BaseSkill<I, O> implements ISkill<I, O> {
  abstract id: string;
  abstract name: string;
  abstract description: string;
  abstract version: string;

  /**
   * Ejecuta el skill con validación de salida estructurada.
   */
  protected async runStructured<T extends z.ZodTypeAny>(
    messages: (SystemMessage | HumanMessage)[],
    schema: T,
    options: { temperature?: number; model_type?: "reasoning" | "ultra" | "fast" } = {}
  ): Promise<{ data: z.infer<T>; usage: { total_tokens: number; cost_usd: number }; model: string }> {
    
    const { data, usage, cost, model } = await LLMService.getStructuredData(
      { type: options.model_type || "ultra", temperature: options.temperature ?? 0 },
      messages,
      schema
    );

    return {
      data,
      usage: {
        total_tokens: usage.total,
        cost_usd: cost
      },
      model: model || "unknown"
    };
  }

  /**
   * Método principal que debe ser implementado por cada Skill.
   */
  abstract run(input: I, context?: unknown): Promise<SkillResponse<O>>;
}
