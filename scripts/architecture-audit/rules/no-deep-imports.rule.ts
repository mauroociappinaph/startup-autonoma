import { SourceFile } from "ts-morph";
import { Rule, Violation } from "../types.js";

export const NoDeepImportsRule: Rule = {
  name: "LEY #10: Path Aliases Obligatorios",
  check(sourceFile: SourceFile): Violation[] {
    const results: Violation[] = [];
    
    sourceFile.getImportDeclarations().forEach((imp) => {
      const moduleSpecifier = imp.getModuleSpecifierValue();
      if (moduleSpecifier.startsWith("../../")) {
        results.push({
          filePath: sourceFile.getFilePath(),
          line: imp.getStartLineNumber(),
          message: `Import relativo profundo detectado ('${moduleSpecifier}'). Usa path aliases (@/).`,
          severity: "error",
        });
      }
    });

    return results;
  },
};
