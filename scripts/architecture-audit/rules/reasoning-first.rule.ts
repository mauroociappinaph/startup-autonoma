import { SourceFile } from "ts-morph";
import { Rule, RuleResult } from "../types.js";

export const ReasoningFirstRule: Rule = {
  name: "LEY #8: Reasoning-First",
  check(sourceFile: SourceFile): RuleResult[] {
    const results: RuleResult[] = [];
    const filePath = sourceFile.getFilePath();
    const content = sourceFile.getFullText();

    const isNodeFile = filePath.includes("/nodes/");
    if (isNodeFile && (content.includes("Schema = z.object({") || content.includes("Schema = z.enum(["))) {
      if (!content.includes("reasoning:")) {
        results.push({
          filePath,
          line: 1,
          message: `Define un esquema de respuesta sin el campo 'reasoning'.`,
          severity: "error",
        });
      }
    }

    return results;
  },
};
