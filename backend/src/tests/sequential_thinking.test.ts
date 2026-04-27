import { jest, describe, it, expect } from '@jest/globals';
import { sequential_thinking } from '../tools/platform/sequential_thinking_tool.js';

describe('sequential_thinking', () => {
  
  it('debería formatear correctamente un paso de pensamiento estándar', async () => {
    const result = await sequential_thinking.invoke({
      thought: "Analizando la base de datos.",
      step: 1,
      total_steps: 3
    });
    
    expect(result).toBe("[Pensamiento 1/3]\nAnalizando la base de datos.");
  });

  it('debería formatear correctamente una revisión de pensamiento', async () => {
    const result = await sequential_thinking.invoke({
      thought: "Corrección: el campo es nullable.",
      step: 2,
      total_steps: 3,
      is_revision: true,
      revises_step: 1
    });
    
    expect(result).toBe("[Pensamiento 2/3] (Revisión del paso 1)\nCorrección: el campo es nullable.");
  });

  it('debería fallar si los argumentos son inválidos (Zod)', async () => {
    // Esto lo maneja LangChain/Zod internamente al invocar
    await expect(sequential_thinking.invoke({
      thought: "",
      step: 0, // Invalido: min(1)
      total_steps: 3
    })).rejects.toThrow();
  });
});
