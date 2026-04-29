import { SkillRegistry } from "./skill_registry.js";
import { CodeChangeImpactAnalysisSkill } from "./software/impact_analysis.js";
import { SacredLogger } from "@/helpers/logger.js";

/**
 * Inicializa y registra todos los Expert Skills disponibles.
 */
export function initializeSkills() {
  SkillRegistry.register(new CodeChangeImpactAnalysisSkill());
  
  // Agregar más skills aquí a medida que se implementen
  SacredLogger.success("Todos los Expert Skills han sido inicializados.", "CORE");
}
