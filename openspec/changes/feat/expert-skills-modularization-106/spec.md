# Specification: Expert Skills Contract

## 1. Overview
Un "Expert Skill" es una unidad de razonamiento atómica y pura. A diferencia de un Worker, un Skill no debería tener efectos secundarios (side effects) como escribir archivos o hacer commits; su función es procesar información y emitir un juicio técnico o estratégico.

## 2. El Contrato (Protocolo XML-Reasoning)
Todo Skill debe adherirse a las "Leyes Sagradas" del proyecto.

### 2.1 Estructura del Output
El campo `reasoning` del Skill DEBE seguir este formato:
```xml
<thought>
  Razonamiento profundo sobre el input recibido.
</thought>
<plan>
  Pasos recomendados para el agente que invoca el skill.
</plan>
<verification>
  Criterios para validar que el plan sea exitoso.
</verification>
```

### 2.2 Interfaz Técnica (TypeScript)
```typescript
/**
 * Contrato universal para todos los Expert Skills.
 */
export interface ISkill<I, O> {
  readonly id: string;
  readonly version: string;
  
  /**
   * Ejecuta la lógica del skill.
   * @param input Datos de entrada (tipado fuerte).
   * @param context Contexto opcional (ej: project_context).
   */
  run(input: I, context?: any): Promise<SkillResponse<O>>;
}

export interface SkillResponse<T> {
  data: T;
  reasoning: string; // XML format
  usage: {
    total_tokens: number;
    cost_usd: number;
  };
}
```

## 3. Registro y Descubrimiento
Los Skills se registran en un `SkillRegistry` central. Los agentes pueden solicitar un skill por su ID.

## 4. Ejemplo: Impact Analysis
- **Input**: `{ description: string, files?: string[] }`
- **Output**: `{ impact_score: number, affected_modules: string[], suggested_tests: string[] }`
