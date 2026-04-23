import { SourceFile } from "ts-morph";
import { Rule, Violation } from "../types.js";

export const StrictXMLRule: Rule = {
  name: "LEY #13: Strict-XML-Formatting",
  check(sourceFile: SourceFile): Violation[] {
    const results: Violation[] = [];
    const filePath = sourceFile.getFilePath();
    const content = sourceFile.getFullText();

    if (filePath.includes("/nodes/") && content.includes("SystemMessage(`")) {
      const requiredTags = ["<thought>", "<plan>", "<verification>"];
      requiredTags.forEach((tag) => {
        if (!content.includes(tag)) {
          results.push({
            filePath,
            line: 1, // Simplified line for now
            message: `El SystemMessage no incluye el tag obligatorio ${tag}.`,
            severity: "error",
          });
        }
      });
    }

    return results;
  },
};
