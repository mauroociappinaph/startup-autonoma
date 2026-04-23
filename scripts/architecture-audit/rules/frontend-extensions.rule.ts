import { SourceFile } from "ts-morph";
import { Rule, Violation } from "../types.js";

export const FrontendExtensionsRule: Rule = {
  name: "LEY #11: Anti-Extensiones (Frontend)",
  check(sourceFile: SourceFile): Violation[] {
    const results: Violation[] = [];
    const filePath = sourceFile.getFilePath();

    if (filePath.includes("/frontend/src/")) {
      sourceFile.getImportDeclarations().forEach((imp) => {
        const moduleSpecifier = imp.getModuleSpecifierValue();
        if (moduleSpecifier.endsWith(".js") || moduleSpecifier.endsWith(".ts") || moduleSpecifier.endsWith(".tsx")) {
          results.push({
            filePath,
            line: imp.getStartLineNumber(),
            message: `Extensión de archivo detectada en import ('${moduleSpecifier}'). Omití .js/.ts/.tsx.`,
            severity: "error",
          });
        }
      });
    }

    return results;
  },
};
