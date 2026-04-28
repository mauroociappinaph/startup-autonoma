import { describe, it, expect } from "@jest/globals";
import { generateSequenceDiagram } from "../helpers/diagramHelper.js";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

describe("DiagramHelper", () => {
  it("should generate a valid Mermaid sequence diagram from messages", () => {
    const messages = [
      new HumanMessage("Crea un proyecto"),
      new AIMessage({
        content: "[CEO_THOUGHT] Delegando al Software Chief",
        additional_kwargs: { node: "ceo" }
      }),
      new AIMessage({
        content: "[SOFTWARE_CHIEF_THOUGHT] Analizando arquitectura",
        additional_kwargs: { node: "software_chief" }
      }),
      new AIMessage({
        content: "[GIT_WORKER] Creando branch",
        additional_kwargs: { node: "git_worker" }
      }),
      new AIMessage({
        content: "[OPERATIONS_CHIEF_THOUGHT] Generando diagrama",
        additional_kwargs: { node: "operations_chief" }
      })
    ];

    const diagram = generateSequenceDiagram(messages);

    expect(diagram).toContain("sequenceDiagram");
    expect(diagram).toContain("Humano->>+CEO: Delegando al Software Chief");
    expect(diagram).toContain("CEO->>+Software Chief: Analizando arquitectura");
    expect(diagram).toContain("Software Chief->>+Git Worker: Creando branch");
    expect(diagram).toContain("Git Worker->>+Operations Chief: Generando diagrama");
  });

  it("should handle empty messages", () => {
    const diagram = generateSequenceDiagram([]);
    expect(diagram).toBe("");
  });
});
