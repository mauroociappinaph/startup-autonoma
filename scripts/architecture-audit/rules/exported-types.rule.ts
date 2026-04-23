import { SourceFile } from "ts-morph";
import { Rule, RuleResult } from "../types.js";

export const ExportedTypesRule: Rule = {
  name: "LEY #7: Ubicación de Contratos/Tipos",
  check(sourceFile: SourceFile): RuleResult[] {
    const results: RuleResult[] = [];
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
