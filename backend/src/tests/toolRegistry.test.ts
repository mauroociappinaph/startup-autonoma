import { jest, describe, it, expect } from '@jest/globals';
import { ToolRegistry, defaultRegistry } from '../mcp_ports/toolRegistry.js';
import { StructuredTool } from "@langchain/core/tools";

describe('ToolRegistry', () => {
  
  it('RF-1.1: debería obtener una herramienta por su nombre', () => {
    const tool = defaultRegistry.getTool("write_file");
    expect(tool).toBeDefined();
    expect(tool.name).toBe("write_file");
    expect(tool).toBeInstanceOf(StructuredTool);
  });

  it('RF-1.2: debería filtrar herramientas por categoría', () => {
    const fsTools = defaultRegistry.getToolsByCategory("filesystem");
    expect(fsTools).toHaveLength(4);
    const toolNames = fsTools.map(t => t.name);
    expect(toolNames).toContain("list_dir");
    expect(toolNames).toContain("read_file");
    expect(toolNames).toContain("write_file");
    expect(toolNames).toContain("patch_file");
  });

  it('RF-1.3: debería lanzar un error si la herramienta no existe', () => {
    expect(() => {
      defaultRegistry.getTool("herramienta_fantasma");
    }).toThrow('[ToolRegistry] Herramienta no encontrada: "herramienta_fantasma"');
  });

  it('RF-1.4: debería listar todas las herramientas registradas (Discovery)', () => {
    const tools = defaultRegistry.listTools();
    expect(tools.length).toBeGreaterThanOrEqual(6);
    expect(tools).toContainEqual(expect.objectContaining({
      name: "save_to_engram",
      category: "platform"
    }));
  });

  it('debería permitir crear un registro personalizado (Factory)', () => {
    const mockTool = { name: "mock_tool" } as any;
    const customRegistry = ToolRegistry.create([
      {
        tool: mockTool,
        descriptor: {
          name: "mock_tool",
          description: "A mock tool",
          category: "testing"
        }
      }
    ]);
    expect(customRegistry.getTool("mock_tool")).toBe(mockTool);
    expect(customRegistry.listTools()).toHaveLength(1);
  });

  it('RF-1.5: debería incluir la herramienta de razonamiento secuencial', () => {
    const reasoningTools = defaultRegistry.getToolsByCategory("reasoning");
    expect(reasoningTools).toHaveLength(1);
    expect(reasoningTools[0].name).toBe("sequential_thinking");
  });
});
