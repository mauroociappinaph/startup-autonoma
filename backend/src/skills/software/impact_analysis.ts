import { BaseSkill } from "../base_skill.js";
import { SkillResponse, ImpactAnalysisOutputSchema, ImpactAnalysisOutput } from "@/types/skills.types.js";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

/**
 * Skill: CodeChangeImpactAnalysis
 * Analiza el impacto técnico de un cambio propuesto antes de la ejecución.
 */
export class CodeChangeImpactAnalysisSkill extends BaseSkill<{ change_description: string }, ImpactAnalysisOutput> {
  id = "code-impact-analysis";
  name = "Análisis de Impacto de Código";
  description = "Evalúa riesgos técnicos y dependencias afectadas por un cambio propuesto.";
  version = "1.0.0";

  async run(input: { change_description: string }): Promise<SkillResponse<ImpactAnalysisOutput>> {
    const systemPrompt = new SystemMessage(`
      Eres un Arquitecto de Software Senior experto en Análisis de Impacto.
      Tu tarea es recibir una descripción de un cambio y predecir qué partes del sistema se verán afectadas.
      
      DEBES responder exclusivamente en formato JSON siguiendo el esquema proporcionado.
      El campo 'reasoning' DEBE contener las etiquetas XML <thought>, <plan> y <verification>.
      
      CRITERIOS DE ANÁLISIS:
      - Si el cambio toca el Core/Graph, el riesgo es > 8.
      - Si el cambio es solo documentación, el riesgo es 1.
      - Identifica dependencias circulares o efectos secundarios en cascada.
    `);

    const humanPrompt = new HumanMessage(`
      CAMBIO PROPUESTO:
      ${input.change_description}
    `);

    const { data, usage, model } = await this.runStructured(
      [systemPrompt, humanPrompt],
      ImpactAnalysisOutputSchema,
      { model_type: "ultra" }
    );

    return {
      data,
      reasoning: data.reasoning,
      usage: {
        ...usage,
        model
      }
    };
  }
}
