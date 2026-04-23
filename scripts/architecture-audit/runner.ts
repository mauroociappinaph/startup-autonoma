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
import { CacheManager } from "./cache-manager.js";

const rules: Rule[] = [
  NoAnyRule,
  MaxLinesRule,
  NoDeepImportsRule,
  ExportedTypesRule,
  FrontendExtensionsRule,
  StrictXMLRule,
  ReasoningFirstRule,
];

const logger = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  warn: (msg: string) => console.warn(`⚠️  ${msg}`),
  error: (msg: string) => console.error(`🚨 ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  header: (msg: string) => console.log(`\n=== ${msg} ===`),
};

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

function getAllFiles(): string[] {
  const files: string[] = [];
  walkDir(process.cwd(), (fsPath) => {
    if (fsPath.endsWith(".ts") || fsPath.endsWith(".tsx")) {
      files.push(fsPath);
    }
  });
  return files;
}

async function run() {
  const project = new Project();
  const allViolations: Violation[] = [];
  let filesToAudit: string[] = [];

  // 1. Structural Checks
  logger.header("Verificando Integridad Estructural");
  const structuralResults = [...checkStructuralIntegrity(), ...checkBarrelFiles()];
  allViolations.push(...structuralResults);

  // 2. Collect Files
  const targetFile = process.argv[2];
  if (targetFile) {
    filesToAudit = [path.resolve(process.cwd(), targetFile)];
  } else if (process.env.CI === "true") {
    logger.info("Modo CI detectado: Escaneo completo activado.");
    filesToAudit = getAllFiles();
  } else {
    try {
      const diffOutput = execSync("git diff --cached --name-only --diff-filter=ACMR", {
        encoding: "utf-8",
        env: { ...process.env, PATH: "/usr/local/bin:/usr/bin:/bin" }
      });
      filesToAudit = diffOutput.split("\n").filter(Boolean).map((f) => path.resolve(process.cwd(), f));
      
      if (filesToAudit.length === 0) {
        logger.info("No hay archivos staged para auditar.");
      } else {
        logger.info(`Auditando archivos staged (${filesToAudit.length} encontrados).`);
      }
    } catch (e) {
      logger.warn("Falla en Git al obtener archivos staged. Fallback a escaneo completo...");
      filesToAudit = getAllFiles();
    }
  }

  // 3. Run Rules per File
  if (filesToAudit.length > 0) {
    logger.header(`Auditoría de Archivos (${filesToAudit.length})`);
    const cache = new CacheManager();
    let cacheHits = 0;
    
    filesToAudit.forEach((file) => {
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return;
      if (!file.endsWith(".ts") && !file.endsWith(".tsx")) return;

      try {
        const content = fs.readFileSync(file, "utf-8");
        const cachedViolations = cache.getValidEntry(file, content);

        if (cachedViolations) {
          allViolations.push(...cachedViolations);
          cacheHits++;
          return;
        }

        const sourceFile = project.createSourceFile(file, content, { overwrite: true });
        const fileViolations: Violation[] = [];

        rules.forEach((rule) => {
          const results = rule.check(sourceFile);
          results.forEach(v => {
            const fullV = { ...v, rule: rule.name };
            fileViolations.push(fullV);
            allViolations.push(fullV);
          });
        });

        cache.updateEntry(file, content, fileViolations);
      } catch (e) {
        logger.error(`Error al procesar el archivo ${file}: ${e instanceof Error ? e.message : String(e)}`);
      }
    });

    if (cacheHits > 0) {
      logger.info(`Incremental: ${cacheHits} archivos recuperados del cache ⚡`);
    }
    cache.save();
  }

  // 4. Report Summary
  const errors = allViolations.filter(v => v.severity === "error");
  const warnings = allViolations.filter(v => v.severity === "warning");

  if (allViolations.length > 0) {
    logger.header("RESUMEN DE AUDITORÍA");
    
    allViolations.forEach(v => {
      const icon = v.severity === "error" ? "🚨" : "⚠️";
      const relativePath = path.relative(process.cwd(), v.filePath);
      const ruleName = v.rule || "General";
      console.log(`${icon} [${ruleName}] ${relativePath}:${v.line} - ${v.message}`);
    });

    console.log("-----------------------");
    logger.info(`Total: ${allViolations.length} | 🚨 Errores: ${errors.length} | ⚠️ Warnings: ${warnings.length}`);
  }

  if (errors.length > 0) {
    logger.error(`Se encontraron ${errors.length} errores críticos. Abortando.`);
    process.exit(1);
  } else {
    logger.success("Auditoría completada con éxito.");
    process.exit(0);
  }
}

run().catch((e) => {
  console.error("Error fatal en la auditoría:", e);
  process.exit(1);
});
