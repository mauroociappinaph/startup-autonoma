import { jest } from "@jest/globals";
import { HumanMessage } from "@langchain/core/messages";

// 1. Mocks de dependencias
const mockGraph: any = {
  getState: jest.fn() as any,
  updateState: jest.fn() as any,
  streamEvents: jest.fn().mockImplementation(async function* () {
    yield { event: "on_node_end", data: { output: {} }, config: { configurable: { checkpoint_id: "cp1" } } };
  }) as any,
};

const mockProjectService: any = {
  getOrCreateProject: (jest.fn() as any).mockResolvedValue({
    projectId: "def-123",
    name: "default-startup",
    workDir: "/tmp/default",
    engramNamespace: "project:default",
    maxTokenBudget: 1000000,
  }),
};

jest.unstable_mockModule("../graph/index.js", () => ({
  getGraph: (jest.fn() as any).mockResolvedValue(mockGraph),
}));

jest.unstable_mockModule("../services/projectService.js", () => ({
  projectService: mockProjectService,
}));

// Import dinámico después de los mocks
const { GraphService } = await import("../services/graphService.js");

describe("GraphService - HITL Resumption (#147)", () => {
  const threadId = "test-thread-123";

  beforeEach(() => {
    jest.clearAllMocks();
    // Configuración por defecto de getState (sin project_context)
    (mockGraph.getState as any).mockResolvedValue({
      values: {
        messages: [new HumanMessage("test")],
        is_mission_approved: false,
      },
      next: [],
    });
  });

  it("RED: debe inyectar un project_context por defecto si el checkpoint no lo tiene", async () => {
    const generator = GraphService.resumeAgent(threadId, "approved");
    
    // Consumir el generador para disparar la lógica
    for await (const _ of generator) {}

    // Verificación 1: Se debió llamar al projectService
    expect(mockProjectService.getOrCreateProject).toHaveBeenCalledWith("default-startup");

    // Verificación 2: Se debió actualizar el estado con el contexto inyectado
    expect(mockGraph.updateState).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        is_mission_approved: true,
        project_context: expect.objectContaining({ projectId: "def-123" }),
      })
    );
  });

  it("RED: no debe pisar el project_context si ya existe en el checkpoint", async () => {
    const existingContext = { projectId: "existing-456", name: "Custom" };
    (mockGraph.getState as any).mockResolvedValue({
      values: {
        project_context: existingContext,
        is_mission_approved: false,
      },
      next: [],
    });

    const generator = GraphService.resumeAgent(threadId, "approved");
    for await (const _ of generator) {}

    // Verificación: NO se debe llamar al projectService si ya hay contexto
    expect(mockProjectService.getOrCreateProject).not.toHaveBeenCalled();

    // Verificación: Se actualiza con el contexto existente (o al menos no con el default)
    expect(mockGraph.updateState).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        is_mission_approved: true,
        project_context: existingContext,
      })
    );
  });
});
