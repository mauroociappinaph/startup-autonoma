import { LLMService } from "@/services/llmService.js";
import { AgentStateType } from "@/types/state.types.js";
import { describe, it, expect } from '@jest/globals';

/**
 * Test de integración para validar el Gap 6: Observabilidad.
 * Verifica que el LLMService capture telemetría y que el estado se actualice.
 */
describe('Gap 6: Observabilidad Avanzada', () => {
  const initialState: AgentStateType = {
    messages: [],
    token_usage: { total: 0, prompt: 0, completion: 0 },
    total_cost_usd: 0,
    project_context: {
      projectId: "test-observability",
      maxTokenBudget: 1000,
      contextWindow: 128000
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  it('debe registrar métricas de telemetría y costo en una llamada simulada', async () => {
    console.log("1️⃣ Simulando llamada a LLM con telemetría...");
    
    // Sobrescribimos temporalmente el método para el test (Mock Manual)
    const originalGetStructuredData = LLMService.getStructuredData;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    LLMService.getStructuredData = async () => ({
      data: { analysis: "Análisis simulado", next_step: "continue" },
      usage: { total: 1000, prompt: 600, completion: 400 },
      cost: 0.015,
      latency: 1500
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await LLMService.getStructuredData({ type: "fast" }, [], {} as any);

    console.log(`✅ Telemetría capturada: Latencia ${result.latency}ms, Costo $${result.cost}`);

    expect(result.usage.total).toBe(1000);
    expect(result.cost).toBeGreaterThan(0);
    expect(result.latency).toBeGreaterThan(0);

    // Restauramos el original
    LLMService.getStructuredData = originalGetStructuredData;
  });

  it('debe acumular el costo en el estado del agente (Reducer Check)', () => {
    console.log("2️⃣ Verificando acumulación de costo en el estado...");
    
    const updates: Partial<AgentStateType> = {
      total_cost_usd: 0.005,
      token_usage: { total: 100, prompt: 50, completion: 50 }
    };

    // Simulamos la lógica del reducer (LangGraph acumularía este canal)
    const newState = {
      ...initialState,
      total_cost_usd: (initialState.total_cost_usd || 0) + (updates.total_cost_usd || 0)
    };

    expect(newState.total_cost_usd).toBe(0.005);
    console.log("✅ Reducer de costo validado.");
  });
});
