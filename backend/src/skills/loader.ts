import { SkillRegistry } from "./skill_registry.js";
import { services } from "@/services/index.js";
import { CodeChangeImpactAnalysisSkill } from "./software/impact_analysis.js";
import { LeadQualificationSkill } from "./business/lead_qualification.js";

/**
 * Inicializa y registra todos los Expert Skills disponibles.
 */
export function initializeSkills() {
  SkillRegistry.register(new CodeChangeImpactAnalysisSkill());
  SkillRegistry.register(new LeadQualificationSkill());
  
  // Agregar más skills aquí a medida que se implementen
  services.logger.success("Todos los Expert Skills han sido inicializados.", "CORE");
}
