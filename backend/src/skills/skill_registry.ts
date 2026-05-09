import { ISkill } from "@/types/skills.types.js";
import { services } from "@/services/index.js";

/**
 * Registro central de Expert Skills.
 * Permite a los agentes descubrir y obtener instancias de skills.
 */
export class SkillRegistry {
  private static skills: Map<string, ISkill<unknown, unknown>> = new Map();

  /**
   * Registra un nuevo skill en el sistema.
   */
  public static register(skill: ISkill<unknown, unknown>) {
    if (this.skills.has(skill.id)) {
      return; // Ya registrado
    }
    services.logger.info(`[SkillRegistry] Registrando skill: ${skill.id} v${skill.version}`, "CORE");
    this.skills.set(skill.id, skill);
  }

  /**
   * Obtiene un skill por su ID.
   */
  public static get<I, O>(id: string): ISkill<I, O> {
    const skill = this.skills.get(id);
    if (!skill) {
      services.logger.error(`[SkillRegistry] Skill no encontrado: ${id}`, "CORE");
      throw new Error(`Skill ${id} not found in registry.`);
    }
    return skill as unknown as ISkill<I, O>;
  }

  /**
   * Lista todos los skills registrados.
   */
  public static list() {
    return Array.from(this.skills.values()).map(s => ({
      id: s.id,
      name: s.name,
      description: s.description
    }));
  }
}
