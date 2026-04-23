import { Project } from "ts-morph";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import { Rule, Violation } from "./types.js";
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
  const allViolations: Violation[] = [];
  let filesToAudit: string[] = [];

  // 1. Structural Checks
  console.log("🏗️  Verificando Integridad Estructural...");
  const structuralResults = [...checkStructuralIntegrity(), ...checkBarrelFiles()];
  
  allViolations.push(...structuralResults);

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

  // 3. Run Rules per File
  if (filesToAudit.length > 0) {
    console.log(`🔍 Auditando ${filesToAudit.length} archivos...\n`);
    
    filesToAudit.forEach((file) => {
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return;
      if (!file.endsWith(".ts") && !file.endsWith(".tsx")) return;

      const sourceFile = project.addSourceFileAtPath(file);
      
      rules.forEach((rule) => {
        const results = rule.check(sourceFile);
        results.forEach(v => allViolations.push({ ...v, rule: rule.name }));
      });
    });
  }

  // 4. Report Summary
  const errors = allViolations.filter(v => v.severity === "error");
  const warnings = allViolations.filter(v => v.severity === "warning");

  if (allViolations.length > 0) {
    console.log("\n📋 RESUMEN DE AUDITORÍA:");
    console.log("-----------------------");
    
    allViolations.forEach(v => {
      const icon = v.severity === "error" ? "🚨" : "⚠️";
      const relativePath = path.relative(process.cwd(), v.filePath);
      const ruleName = v.rule || "General";
      console.log(`${icon} [${ruleName}] ${relativePath}:${v.line} - ${v.message}`);
    });

    console.log("-----------------------");
    console.log(`✅ Total: ${allViolations.length} | 🚨 Errores: ${errors.length} | ⚠️ Warnings: ${warnings.length}`);
  }

  if (errors.length > 0) {
    console.error(`\n❌ Se encontraron ${errors.length} errores críticos. Abortando.`);
    process.exit(1);
  } else {
    console.log("\n✅ Auditoría completada con éxito.");
    process.exit(0);
  }
}

run().catch((e) => {
  console.error("Error fatal en la auditoría:", e);
  process.exit(1);
});
