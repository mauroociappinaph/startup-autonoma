import { SyntaxKind, SourceFile } from "ts-morph";
import { Rule, Violation } from "../types.js";

export const NoConsoleRule: Rule = {
  name: "LEY #14: Logger Obligatorio",
  check(sourceFile: SourceFile): Violation[] {
    const results: Violation[] = [];
    const filePath = sourceFile.getFilePath();
    
    // Ignoramos tests y scripts, solo nos importa el código productivo
    if (filePath.includes(".test.") || filePath.includes(".spec.") || filePath.includes("/scripts/")) {
      return [];
    }

    sourceFile.forEachDescendant((node) => {
      if (node.getKind() === SyntaxKind.PropertyAccessExpression) {
        const text = node.getText();
        if (text === "console.log") {
          results.push({
            filePath,
            line: node.getStartLineNumber(),
            message: "Se detectó un console.log. Se recomienda usar un logger estructurado.",
            severity: "warning",
          });
        }
      }
    });

    return results;
  },
};
