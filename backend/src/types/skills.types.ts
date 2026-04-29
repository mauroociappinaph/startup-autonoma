import { z } from "zod";

/**
 * Respuesta estandarizada de un Expert Skill.
 */
export interface SkillResponse<T> {
  data: T;
  reasoning: string; // Formato XML: <thought>, <plan>, <verification>
  usage: {
    total_tokens: number;
    cost_usd: number;
    model: string;
  };
}

/**
 * Interfaz base para cualquier Expert Skill.
 */
export interface ISkill<I, O> {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly version: string;

  /**
   * Ejecuta la lógica del skill.
   */
  run(input: I, context?: unknown): Promise<SkillResponse<O>>;
}

/**
 * Esquema de salida para el análisis de impacto.
 */
export const ImpactAnalysisOutputSchema = z.object({
  reasoning: z.string().describe("Razonamiento XML con <thought>, <plan>, <verification>."),
  impact_score: z.number().min(1).max(10).describe("Nivel de riesgo del cambio (1-10)."),
  affected_modules: z.array(z.string()).describe("Módulos o directorios que podrían verse afectados."),
  suggested_tests: z.array(z.string()).describe("Nombres de archivos de test o suites que deberían ejecutarse."),
  critical_warnings: z.array(z.string()).describe("Alertas de seguridad o de arquitectura.")
});

export type ImpactAnalysisOutput = z.infer<typeof ImpactAnalysisOutputSchema>;

/**
 * Esquema de salida para la calificación de leads.
 */
export const LeadQualificationOutputSchema = z.object({
  reasoning: z.string().describe("Razonamiento XML con <thought>, <plan>, <verification>."),
  qualified_leads: z.array(z.object({
    name: z.string(),
    company: z.string().optional(),
    contact: z.string().optional(),
    score: z.number().min(1).max(10),
    justification: z.string()
  })).describe("Lista de leads filtrados y puntuados."),
  market_fit_analysis: z.string().describe("Breve análisis de por qué estos leads encajan en el nicho.")
});

export type LeadQualificationOutput = z.infer<typeof LeadQualificationOutputSchema>;

export interface LeadQualificationInput {
  leads: unknown[];
  niche: string;
  min_score?: number;
}

/**
 * Esquema base para el razonamiento de un Skill.
 * Útil para validaciones estructuradas.
 */
export const SkillReasoningSchema = z.object({
  thought: z.string(),
  plan: z.array(z.string()),
  verification: z.string()
});
