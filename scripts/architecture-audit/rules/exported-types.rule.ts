import { SourceFile } from "ts-morph";
import { Rule, Violation } from "../types.js";

export const ExportedTypesRule: Rule = {
  name: "LEY #7: Ubicación de Contratos/Tipos",
  check(sourceFile: SourceFile): Violation[] {
    const results: Violation[] = [];
    const filePath = sourceFile.getFilePath();

    const isTypesDir = filePath.includes("/types/") || filePath.includes("/contracts/") || filePath.includes("/state/");
    
    if (!isTypesDir) {
      const hasTypes = sourceFile.getInterfaces().length > 0 ||
                       sourceFile.getTypeAliases().length > 0;
      
      if (hasTypes) {
        results.push({
          filePath,
          line: 1,
          message: `Se detectó definición de tipos/interfaces en un archivo de lógica. Por Ley de Granularidad, todos los tipos deben ir en /types, /contracts o /state.`,
          severity: "error",
        });
      }
    }

    return results;
  },
};
