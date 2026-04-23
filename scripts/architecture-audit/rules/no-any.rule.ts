import { SyntaxKind, SourceFile } from "ts-morph";
import { Rule, Violation } from "../types.js";

export const NoAnyRule: Rule = {
  name: "LEY #5: Tipado Estricto (No Any)",
  check(sourceFile: SourceFile): Violation[] {
    const results: Violation[] = [];
    const filePath = sourceFile.getFilePath();
    const lines = sourceFile.getFullText().split("\n");

    sourceFile.forEachDescendant((node) => {
      if (node.getKind() === SyntaxKind.AnyKeyword) {
        const startLine = node.getStartLineNumber();
        const lineText = lines[startLine - 1];
        
        if (!lineText.includes("eslint-disable")) {
          results.push({
            filePath,
            line: startLine,
            message: `Uso de 'any' detectado.`,
            severity: "error",
          });
        }
      }
    });

    return results;
  },
};
