import { StructuredTool } from "@langchain/core/tools";
import { 
  list_dir, 
  read_file, 
  write_file, 
  patch_file, 
  test_runner, 
  save_to_engram,
  sequential_thinking
} from "@/tools/index.js";

import { 
  ToolCategory, 
  ToolDescriptor, 
  RegisteredTool 
} from "@/types/mcp.types.js";

/**
 * ToolRegistry: Registro centralizado con capacidades de Discovery.
 * Implementa el patrón Factory para permitir inyección en tests.
 */
export class ToolRegistry {
  private tools: Map<string, RegisteredTool>;

  private constructor(registeredTools: RegisteredTool[]) {
    this.tools = new Map(registeredTools.map(rt => [rt.descriptor.name, rt]));
  }

  /**
   * Crea una nueva instancia del registro.
   */
  static create(tools: RegisteredTool[]): ToolRegistry {
    return new ToolRegistry(tools);
  }

  /**
   * Obtiene una herramienta por su nombre único.
   * @throws Error si la herramienta no está registrada.
   */
  getTool(name: string): StructuredTool {
    const registered = this.tools.get(name);
    if (!registered) {
      throw new Error(`[ToolRegistry] Herramienta no encontrada: "${name}". Verifica el nombre o la categoría.`);
    }
    return registered.tool;
  }

  /**
   * Filtra las herramientas por categoría.
   */
  getToolsByCategory(category: ToolCategory): StructuredTool[] {
    return Array.from(this.tools.values())
      .filter(rt => rt.descriptor.category === category)
      .map(rt => rt.tool);
  }

  /**
   * Lista todas las herramientas registradas para propósitos de Discovery de agentes.
   */
  listTools(): ToolDescriptor[] {
    return Array.from(this.tools.values()).map(rt => rt.descriptor);
  }
}

/**
 * Instancia por defecto con todas las herramientas core del sistema.
 */
export const defaultRegistry = ToolRegistry.create([
  {
    tool: list_dir,
    descriptor: {
      name: "list_dir",
      description: "Lista archivos y carpetas en una ruta específica.",
      category: "filesystem"
    }
  },
  {
    tool: read_file,
    descriptor: {
      name: "read_file",
      description: "Lee el contenido de un archivo de texto.",
      category: "filesystem"
    }
  },
  {
    tool: write_file,
    descriptor: {
      name: "write_file",
      description: "Crea o sobrescribe un archivo con contenido nuevo.",
      category: "filesystem"
    }
  },
  {
    tool: patch_file,
    descriptor: {
      name: "patch_file",
      description: "Modifica un bloque específico dentro de un archivo.",
      category: "filesystem"
    }
  },
  {
    tool: test_runner,
    descriptor: {
      name: "test_runner",
      description: "Ejecuta suites de pruebas unitarias y de integración.",
      category: "testing"
    }
  },
  {
    tool: save_to_engram,
    descriptor: {
      name: "save_to_engram",
      description: "Persiste conocimiento en la memoria organizacional.",
      category: "platform"
    }
  },
  {
    tool: sequential_thinking,
    descriptor: {
      name: "sequential_thinking",
      description: "Desglosa problemas complejos en pasos de pensamiento secuencial.",
      category: "reasoning"
    }
  }
]);
