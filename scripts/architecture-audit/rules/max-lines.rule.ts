import { SourceFile } from "ts-morph";
import { Rule, Violation } from "../types.js";

const MAX_LINES = 300;

export const MaxLinesRule: Rule = {
  name: "LEY #3: Límites de Archivo",
  check(sourceFile: SourceFile): Violation[] {
    const results: Violation[] = [];
    const lineCount = sourceFile.getFullText().split("\n").length;

    if (lineCount > MAX_LINES) {
      results.push({
        filePath: sourceFile.getFilePath(),
        line: lineCount,
        message: `El archivo tiene ${lineCount} líneas (Máximo ${MAX_LINES}).`,
        severity: "error",
      });
    }

    return results;
  },
};
