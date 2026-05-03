import { tool } from "@langchain/core/tools";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Definimos la raíz del proyecto para el sandboxing de forma robusta
// fs.ts está en backend/src/tools/, por lo que subimos 3 niveles para llegar a la raíz del monorepo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..", "..", ".."); 

/**
 * Valida que una ruta esté dentro de los límites del proyecto.
 */
export function validatePath(targetPath: string) {
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

/**
 * Herramienta para escribir código o texto dentro de un archivo. Si no existe, lo crea.
 */
export const write_file = tool(
  async ({ file_path, content }) => {
    try {
      const safePath = validatePath(file_path);
      // Asegurarse de que el directorio padre existe
      await fs.mkdir(path.dirname(safePath), { recursive: true });
      await fs.writeFile(safePath, content, "utf-8");
      return `Archivo escrito exitosamente: ${file_path}`;
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  },
  {
    name: "write_file",
    description: "Crea o sobrescribe completamente un archivo con el contenido especificado. Ideal para crear nuevos archivos o reemplazar todo un módulo.",
    schema: z.object({
      file_path: z.string().describe("Ruta relativa del archivo al que se escribirá."),
      content: z.string().describe("El contenido exacto a guardar.")
    })
  }
);

/**
 * Herramienta para reemplazar un bloque específico en un archivo existente.
 * Requiere coincidencia exacta del 'target_content' para prevenir corrupción.
 */
export const patch_file = tool(
  async ({ file_path, target_content, replacement_content }) => {
    try {
      const safePath = validatePath(file_path);
      const content = await fs.readFile(safePath, "utf-8");
      
      if (!content.includes(target_content)) {
        return { error: `No se encontró coincidencia exacta ('target_content') en ${file_path}. Recuerda incluir los espacios correctos.`};
      }
      
      const newContent = content.replace(target_content, replacement_content);
      await fs.writeFile(safePath, newContent, "utf-8");
      return `Archivo modificado (patch) exitosamente: ${file_path}`;
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  },
  {
    name: "patch_file",
    description: "Reemplaza exactamente el 'target_content' por el 'replacement_content' en un archivo existente. Usa esto para cambiar pedazos de código sin borrar el resto.",
    schema: z.object({
      file_path: z.string().describe("Ruta relativa al archivo a patchear."),
      target_content: z.string().describe("El pedazo exacto de código (incluyendo espacios/saltos) que vas a reemplazar."),
      replacement_content: z.string().describe("El nuevo código que ingresará en su lugar.")
    })
  }
);
