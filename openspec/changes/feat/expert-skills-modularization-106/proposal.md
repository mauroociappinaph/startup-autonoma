# Propuesta: Framework de Expert Skills (Issue #106)

## Objetivo
Modularizar la lógica de razonamiento de los agentes en componentes reutilizables denominados "Expert Skills". Esto permite que tareas complejas (como el análisis de impacto de código) sean compartidas entre diferentes Chiefs y mantengan un contrato de salida consistente.

## Problema Actual
- Los Chiefs (Software, Business, Operations) tienen prompts de sistema masivos que intentan cubrir todas las posibilidades.
- La lógica de "razonamiento profundo" (<thought>, <plan>, <verification>) está hardcodeada en cada nodo.
- No hay una forma limpia de que un Chief use una capacidad de otro sin duplicar lógica.

## Diseño Propuesto

### 1. Estructura de un "Expert Skill"
Cada Skill vivirá en `backend/src/skills/` y seguirá una interfaz estricta.

```typescript
export interface SkillOutput<T> {
  reasoning: string; // Contiene <thought>, <plan>, <verification>
  data: T;
  status: 'success' | 'failure';
}

export abstract class BaseSkill<I, O> {
  abstract name: string;
  abstract description: string;
  
  abstract execute(input: I): Promise<SkillOutput<O>>;
}
```

### 2. Skill de Ejemplo: `CodeChangeImpactAnalysis`
Este skill recibirá un diff o una descripción de cambio y analizará:
- Qué archivos se rompen.
- Qué tests deben correrse.
- Riesgos de seguridad.

### 3. Integración en el Grafo
Los Chiefs invocarán a los Skills como parte de su proceso de toma de decisiones, no como nodos separados del grafo, para mantener la latencia baja y el contexto unificado.

## Plan de Acción
1. **Core**: Crear `BaseSkill` y `SkillManager` en `backend/src/skills/`.
2. **Types**: Definir los tipos globales para Skills en `backend/src/types/skills.types.ts`.
3. **Implementación**: Crear el skill `CodeChangeImpactAnalysisSkill`.
4. **Refactor**: Actualizar `SoftwareChief` para delegar el análisis de impacto a este nuevo skill.

## Verificación
- Tests unitarios para cada Skill.
- Validación de que el output del Skill cumple con las "Leyes Sagradas" (Reasoning-First).
