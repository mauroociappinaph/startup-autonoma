import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import {
  CodeResearcherInputSchema,
  CodeResearcherInput,
  CodeResearcherResponse
} from "@/types/code-researcher.types.js";

/**
 * Helper CodeResearcher: Ejecuta acciones de exploración y lectura de archivos.
 */
export async function codeResearcher(input: CodeResearcherInput): Promise<CodeResearcherResponse> {
  const { payload, rootPath } = CodeResearcherInputSchema.parse(input);
  const targetRoot = rootPath || process.cwd();
  
  console.log(`--- [CODE RESEARCHER] Ejecutando acción: ${payload.action} ---`);

  try {
    switch (payload.action) {
      case "list_files": {
        const relativePath = payload.path || ".";
        const recursiveFlag = payload.recursive ? "-R" : "";
        const command = `ls -F ${recursiveFlag} ${relativePath}`;
        
        const { stdout } = await execPromise(command, targetRoot);
        return { success: true, action: "list_files", data: stdout };
      }

      case "read_file": {
        const filePath = path.join(targetRoot, payload.path);
        const content = await fs.readFile(filePath, "utf-8");
        return { success: true, action: "read_file", data: content };
      }

      case "search_pattern": {
        const includeFlag = payload.include ? payload.include.map(i => `--include="${i}"`).join(" ") : "";
        const searchPath = payload.path || ".";
        // Ripgrep (rg) es más rápido, pero grep es estándar
        const command = `grep -rInE ${includeFlag} "${payload.pattern}" ${searchPath} | head -n 50`;
        
        const { stdout } = await execPromise(command, targetRoot);
        return { success: true, action: "search_pattern", data: stdout };
      }

      default:
        throw new Error(`Acción no soportada`);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error(`❌ Error en Code Researcher [${payload.action}]:`, errorMessage);
    return {
      success: false,
      action: payload.action,
      errorMessage: errorMessage
    };
  }
}

function execPromise(command: string, cwd: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error && error.code !== 1) { // grep devuelve 1 si no hay matches, no es un error "fata"
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}
