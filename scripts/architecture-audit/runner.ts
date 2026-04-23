import { Project } from "ts-morph";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import { Rule, RuleResult } from "./types.js";
import { NoAnyRule } from "./rules/no-any.rule.js";
import { MaxLinesRule } from "./rules/max-lines.rule.js";
import { NoDeepImportsRule } from "./rules/no-deep-imports.rule.js";
import { ExportedTypesRule } from "./rules/exported-types.rule.js";
import { FrontendExtensionsRule } from "./rules/frontend-extensions.rule.js";
import { StrictXMLRule } from "./rules/strict-xml.rule.js";
import { ReasoningFirstRule } from "./rules/reasoning-first.rule.js";
import { checkBarrelFiles, checkStructuralIntegrity } from "./structural-checks.js";

const rules: Rule[] = [
  NoAnyRule,
  MaxLinesRule,
  NoDeepImportsRule,
  ExportedTypesRule,
  FrontendExtensionsRule,
  StrictXMLRule,
  ReasoningFirstRule,
];

function walkDir(dir: string, callback: (path: string) => void) {
  const IGNORE_DIRS = ["node_modules", "dist", ".git", ".next", ".husky", ".github", ".venv", "venv"];
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach((f) => {
    const dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      if (!IGNORE_DIRS.includes(f)) walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

async function run() {
  const project = new Project();
  let errors = 0;
  let filesToAudit: string[] = [];

  // 1. Structural Checks
  console.log("🏗️  Verificando Integridad Estructural...");
  const structuralResults = [...checkStructuralIntegrity(), ...checkBarrelFiles()];
  structuralResults.forEach((res) => {
    console.error(`${res.severity === "error" ? "🚨" : "⚠️"} [${res.filePath}]: ${res.message}`);
    if (res.severity === "error") errors++;
  });

  if (errors > 0) {
     console.error(`\n❌ Se encontraron ${errors} infracciones estructurales.`);
     process.exit(1);
  }

  // 2. Collect Files
  if (process.env.CI) {
    console.log("📡 Entorno CI detectado: Escaneando todo el proyecto...");
    walkDir(process.cwd(), (fsPath) => {
      if (fsPath.endsWith(".ts") || fsPath.endsWith(".tsx")) {
        filesToAudit.push(fsPath);
      }
    });
  } else {
    const targetFile = process.argv[2];
    if (targetFile) {
      filesToAudit = [path.resolve(process.cwd(), targetFile)];
    } else {
      try {
        const diffOutput = execSync("git diff --cached --name-only --diff-filter=ACMR", {
          encoding: "utf-8",
        });
        filesToAudit = diffOutput.split("\n").filter(Boolean).map((f) => path.resolve(process.cwd(), f));
      } catch (e) {
        console.error("No se pudo obtener la lista de archivos de Git.");
        process.exit(1);
      }
    }
  }

  if (filesToAudit.length === 0) {
    console.log("✅ No hay archivos para auditar. Adelante.");
    process.exit(0);
  }

  // 3. Run Rules per File
  console.log(`🔍 Auditando ${filesToAudit.length} archivos...\n`);
  
  filesToAudit.forEach((file) => {
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return;
    if (!file.endsWith(".ts") && !file.endsWith(".tsx")) return;

    const sourceFile = project.addSourceFileAtPath(file);
    
    rules.forEach((rule) => {
      const results = rule.check(sourceFile);
      results.forEach((res) => {
        console.error(`${res.severity === "error" ? "🚨" : "⚠️"} [${rule.name}]: ${path.relative(process.cwd(), res.filePath)}:${res.line} - ${res.message}`);
        if (res.severity === "error") errors++;
      });
    });
  });

  if (errors > 0) {
    console.error(`\n❌ Se encontraron ${errors} infracciones a la arquitectura.`);
    process.exit(1);
  } else {
    console.log("✅ Todas las Leyes Sagradas se cumplen a rajatabla.");
  }
}

run().catch((e) => {
  console.error("Error fatal en la auditoría:", e);
  process.exit(1);
});
