import 'dotenv/config';
import { CodeChangeImpactAnalysisSkill } from "@/skills/software/impact_analysis.js";
import { SkillRegistry } from "@/skills/skill_registry.js";

describe("CodeChangeImpactAnalysisSkill", () => {
  let skill: CodeChangeImpactAnalysisSkill;

  beforeAll(() => {
    skill = new CodeChangeImpactAnalysisSkill();
    SkillRegistry.register(skill);
  });

  it("debería analizar correctamente un cambio de alto riesgo", async () => {
    const input = {
      change_description: "Modificar el núcleo de orquestación de LangGraph en backend/src/graph/index.ts para cambiar la lógica de reintentos."
    };

    const response = await skill.run(input);
    expect(response.data.impact_score).toBeGreaterThanOrEqual(7);
    expect(response.data.affected_modules.length).toBeGreaterThan(0);
    expect(response.reasoning).toContain("<thought>");
    expect(response.reasoning).toContain("<plan>");
    expect(response.reasoning).toContain("<verification>");
    
    console.log("✅ Impact Analysis Test Result:", JSON.stringify(response.data, null, 2));
  }, 120000); // 120s timeout para LLM

  it("debería dar riesgo bajo para documentación", async () => {
    const input = {
      change_description: "Actualizar el README.md agregando instrucciones de instalación de Docker."
    };

    const response = await skill.run(input);

    expect(response.data.impact_score).toBeLessThanOrEqual(3);
    console.log("✅ Doc Analysis Test Result:", response.data.impact_score);
  }, 120000);
});
