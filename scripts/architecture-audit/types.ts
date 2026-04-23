import { SourceFile } from "ts-morph";

export interface Violation {
  rule?: string;
  filePath: string;
  line: number;
  message: string;
  severity: "error" | "warning";
}

export interface Rule {
  name: string;
  check(sourceFile: SourceFile): Violation[];
}
