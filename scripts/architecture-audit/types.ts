import { SourceFile } from "ts-morph";

export interface RuleResult {
  filePath: string;
  line: number;
  message: string;
  severity: "error" | "warning";
}

export interface Rule {
  name: string;
  check(sourceFile: SourceFile): RuleResult[];
}
