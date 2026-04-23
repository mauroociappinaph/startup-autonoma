import { SourceFile } from "ts-morph";
import { Rule, Violation } from "../types.js";

export const ExportedTypesRule: Rule = {
  name: "LEY #7: Ubicación de Contratos/Tipos",
  check(sourceFile: SourceFile): Violation[] {
    const results: Violation[] = [];
    const filePath = sourceFile.getFilePath();

    const isTypesDir = filePath.includes("/types/") || filePath.includes("/contracts/") || filePath.includes("/state/");
    
    if (!isTypesDir) {
      const hasExportedTypes = sourceFile.getInterfaces().some(i => i.isExported()) ||
                               sourceFile.getTypeAliases().some(t => t.isExported());
      
      if (hasExportedTypes) {
        results.push({
          filePath,
          line: 1,
          message: `Se detectó exportación de tipos. Deben ir en /types o /contracts.`,
          severity: "error",
        });
      }
    }

    return results;
  },
};
