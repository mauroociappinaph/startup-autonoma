/* eslint-disable */
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

// Definimos la raíz del proyecto para el sandboxing
// Asumimos que el agente opera desde la raíz del monorepo
const PROJECT_ROOT = path.resolve(process.cwd(), ".."); 

/**
 * Valida que una ruta esté dentro de los límites del proyecto.
 */
function validatePath(targetPath: string) {
  const resolved = path.resolve(PROJECT_ROOT, targetPath);
  if (!resolved.startsWith(PROJECT_ROOT)) {
    throw new Error(`Acceso denegado: La ruta ${targetPath} está fuera de los límites del proyecto.`);
  }
  return resolved;
}

/**
 * Herramienta para listar contenidos de un directorio.
 */
export const list_dir = tool(
  async ({ dir_path = "." }) => {
    try {
      const safePath = validatePath(dir_path);
      const entries = await fs.readdir(safePath, { withFileTypes: true });
      
      return entries.map(e => ({
        name: e.name,
        type: e.isDirectory() ? "directory" : "file"
      }));
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  },
  {
    name: "list_dir",
    description: "Lista archivos y carpetas en una ruta específica dentro del proyecto.",
    schema: z.object({
      dir_path: z.string().optional().describe("Ruta relativa al proyecto (default: '.')")
    })
  }
);

/**
 * Herramienta para leer el contenido de un archivo de texto.
 */
export const read_file = tool(
  async ({ file_path }) => {
    try {
      const safePath = validatePath(file_path);
      const content = await fs.readFile(safePath, "utf-8");
      return content;
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  },
  {
    name: "read_file",
    description: "Lee el contenido de texto de un archivo específico del repositorio.",
    schema: z.object({
      file_path: z.string().describe("Ruta relativa al archivo que se desea leer.")
    })
  }
);
