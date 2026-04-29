# Tasks: Expert Skills Modularization (#106)

## Fase 1: Infraestructura del Framework
- [ ] Crear `backend/src/types/skills.types.ts` con las interfaces base.
- [ ] Implementar `BaseSkill` abstract class en `backend/src/skills/base_skill.ts`.
- [ ] Implementar `SkillRegistry` para la carga dinámica de skills.

## Fase 2: Implementación de Skills Expertos
- [ ] Crear el Skill `CodeChangeImpactAnalysisSkill` en `backend/src/skills/software/impact_analysis.ts`.
    - Debe usar un modelo `ultra` o `reasoning`.
    - Debe retornar un esquema Zod con: `files_affected`, `test_recommendations`, `risk_level`.
- [ ] (Opcional) Crear el Skill `LeadQualificationSkill` en `backend/src/skills/business/lead_qualification.ts` (migrar lógica del BusinessChief).

## Fase 3: Integración y Refactor
- [ ] Actualizar el prompt del `SoftwareChief` para que sepa que puede consultar el `ImpactAnalysisSkill`.
- [ ] Integrar la llamada al skill dentro del nodo `software_chief_node`.

## Fase 4: Verificación
- [ ] Crear tests unitarios en `backend/src/tests/skills/impact_analysis.test.ts`.
- [ ] Ejecutar flujo completo y verificar logs de auditoría.
