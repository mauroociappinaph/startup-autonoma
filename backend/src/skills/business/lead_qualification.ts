import { BaseSkill } from "../base_skill.js";
import { SkillResponse, LeadQualificationOutputSchema, LeadQualificationOutput, LeadQualificationInput } from "@/types/skills.types.js";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

/**
 * Skill: LeadQualification
 * Filtra y califica prospectos comerciales basados en relevancia de nicho y score.
 */
export class LeadQualificationSkill extends BaseSkill<LeadQualificationInput, LeadQualificationOutput> {
  id = "lead-qualification";
  name = "Calificación de Leads B2B";
  description = "Analiza y puntúa prospectos comerciales para asegurar el market-fit.";
  version = "1.0.0";

  async run(input: LeadQualificationInput): Promise<SkillResponse<LeadQualificationOutput>> {
    const minScore = input.min_score ?? 7;

    const systemPrompt = new SystemMessage(`
      Eres un Growth Hacker experto en prospección B2B y Outbound Marketing.
      Tu tarea es calificar una lista de leads crudos para el nicho: ${input.niche}.
      
      DEBES responder exclusivamente en formato JSON siguiendo el esquema proporcionado.
      El campo 'reasoning' DEBE contener las etiquetas XML <thought>, <plan> y <verification>.
      
      CRITERIOS DE CALIFICACIÓN:
      - Relevancia: ¿La empresa/persona pertenece realmente al nicho?
      - Potencial: ¿Parece tener presupuesto o necesidad del servicio?
      - Calidad de Datos: ¿Tienen información de contacto válida?
      
      FILTRO: Solo devuelve leads con un score >= ${minScore}.
    `);

    const humanPrompt = new HumanMessage(`
      LEADS A ANALIZAR:
      ${JSON.stringify(input.leads, null, 2)}
    `);

    const { data, usage, model } = await this.runStructured(
      [systemPrompt, humanPrompt],
      LeadQualificationOutputSchema,
      { model_type: "reasoning" }
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
