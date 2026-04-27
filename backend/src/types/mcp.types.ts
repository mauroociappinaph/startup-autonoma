import { StructuredTool } from "@langchain/core/tools";

/**
 * Categorías válidas para las herramientas del sistema.
 */
export type ToolCategory = "filesystem" | "testing" | "platform" | "git" | "ai-engine" | "reasoning";

/**
 * Descriptor público de una herramienta para Discovery.
 */
export interface ToolDescriptor {
  name: string;
  description: string;
  category: ToolCategory;
}

/**
 * Representa una herramienta registrada internamente.
 */
export interface RegisteredTool {
  tool: StructuredTool;
  descriptor: ToolDescriptor;
}
