import { describe, it, expect, jest } from "@jest/globals";
import { operations_chief_node } from "../nodes/chiefs/operations_chief.js";
import { operations_worker_node } from "../nodes/workers/operations_worker_node.js";
import { AIMessage } from "@langchain/core/messages";
import { AgentStateType } from "@startup/shared";
import fs from "fs";
import path from "path";

import { LLMService } from "../services/llmService.js";

// Espiamos el método estático de LLMService
const mockGetStructuredData = jest.spyOn(LLMService, "getStructuredData").mockResolvedValue({
  data: {
    reasoning: "Generando diagrama de observabilidad.",
    action: "generate_sequence_diagram",
    details: "all",
    priority: "medium",
    requires_approval: false
  },
  usage: { total: 100, prompt: 50, completion: 50 },
  cost: 0.001,
  latency: 500,
  model: "gpt-4o"
} as any);

describe("Operations Integration", () => {
  it("should flow from chief to worker and generate a diagram file", async () => {
    const initialState: AgentStateType = {
      original_prompt: "Muestrame que hiciste",
      refined_prompt: "Generar diagrama de secuencia",
      messages: [],
      iteration_count: 0,
      token_usage: { total: 0, prompt: 0, completion: 0 },
      retry_count: 0,
      plan: [],
      completed_steps: [],
      executive_summary: ""
    };

    // 1. Ejecutar el Chief
    const chiefUpdate = await operations_chief_node(initialState);
    expect(chiefUpdate.next_node).toBe("operations_worker");
    
    const intermediateState = { ...initialState, ...chiefUpdate } as AgentStateType;

    // 2. Ejecutar el Worker
    const workerUpdate = await operations_worker_node(intermediateState);
    
    expect(workerUpdate.executive_summary).toContain("Se ha generado un diagrama de secuencia");
    expect(workerUpdate.completed_steps).toContain("generate_sequence_diagram");

    // 3. Verificar que el archivo existe
    const docsDir = path.join(process.cwd(), "docs/architecture/sequences");
    const files = fs.readdirSync(docsDir);
    const mmdFiles = files.filter(f => f.endsWith(".mmd"));
    expect(mmdFiles.length).toBeGreaterThan(0);
  });
});
