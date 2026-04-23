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
  const IGNORE_DIRS = [
    "node_modules", "dist", ".git", ".next", ".husky", ".github", ".venv", "venv",
    "tests", "__tests__", "mocks", "spec"
  ];
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
  const TARGET_DIRS = ["backend/src", "frontend/src"];
  
  TARGET_DIRS.forEach(dir => {
    const fullDir = path.join(process.cwd(), dir);
    if (fs.existsSync(fullDir)) {
      walkDir(fullDir, (fsPath) => {
        const basename = path.basename(fsPath);
        const isTest = fsPath.includes("/tests/") || fsPath.includes("/__tests__/") || 
                       fsPath.includes(".test.") || fsPath.includes(".spec.") ||
                       basename.startsWith("test-");
        
        if ((fsPath.endsWith(".ts") || fsPath.endsWith(".tsx")) && !isTest) {
          files.push(fsPath);
        }
      });
    }
  });
  return files;
}

async function run() {
  const project = new Project();
  const allViolations: Violation[] = [];
  let filesToAudit: string[] = [];

  // 1. Structural Checks (Siempre corren, validan integridad del repo)
  logger.header("Verificando Integridad Estructural");
  const structuralResults = [...checkStructuralIntegrity(), ...checkBarrelFiles()];
  allViolations.push(...structuralResults);

  // 2. Collect Files
  const targetFile = process.argv[2];
  if (targetFile) {
    filesToAudit = [path.resolve(process.cwd(), targetFile)];
  } else if (process.env.CI === "true") {
    logger.info("Modo CI detectado: Escaneando backend/src y frontend/src...");
    filesToAudit = getAllFiles();
  } else {
    try {
      const diffOutput = execSync("git diff --cached --name-only --diff-filter=ACMR", {
        encoding: "utf-8",
        env: { ...process.env, PATH: "/usr/local/bin:/usr/bin:/bin" }
      });
      filesToAudit = diffOutput.split("\n")
        .filter(Boolean)
        .map((f) => path.resolve(process.cwd(), f))
        // Solo auditamos archivos en src y EXCLUIMOS tests/mocks
        .filter(f => {
          const isProductive = f.includes("/backend/src/") || f.includes("/frontend/src/");
          const isTest = f.includes("/tests/") || f.includes("/__tests__/") || 
                         f.includes(".test.") || f.includes(".spec.") ||
                         path.basename(f).startsWith("test-") ||
                         path.basename(f).startsWith("jest-");
          return isProductive && !isTest;
        });
      
      if (filesToAudit.length === 0) {
        logger.info("No hay archivos staged productivos para auditar.");
      } else {
        logger.info(`Auditando ${filesToAudit.length} archivos staged (filtrados por src).`);
      }
    } catch (e) {
      logger.warn("Falla en Git. Fallback a escaneo completo de src...");
      filesToAudit = getAllFiles();
    }
  }

  // 3. Run Rules per File
  if (filesToAudit.length > 0) {
    logger.header(`Auditoría de Archivos (${filesToAudit.length})`);
    const cache = new CacheManager();
    let cacheHits = 0;

    const auditResults = await Promise.all(
      filesToAudit.map(async (file) => {
        if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return [];
        if (!file.endsWith(".ts") && !file.endsWith(".tsx")) return [];

        try {
          const content = await fs.promises.readFile(file, "utf-8");
          const cachedViolations = cache.getValidEntry(file, content);

          if (cachedViolations) {
            cacheHits++;
            return cachedViolations;
          }

          // Nota: ts-morph Project no es totalmente thread-safe para escrituras paralelas,
          // pero como usamos createSourceFile con contenido único, funciona bien en este flujo.
          const sourceFile = project.createSourceFile(file, content, { overwrite: true });
          const fileViolations: Violation[] = [];

          rules.forEach((rule) => {
            const results = rule.check(sourceFile);
            results.forEach((v) => {
              fileViolations.push({ ...v, rule: rule.name });
            });
          });

          cache.updateEntry(file, content, fileViolations);
          return fileViolations;
        } catch (e) {
          logger.error(`Error al procesar el archivo ${file}: ${e instanceof Error ? e.message : String(e)}`);
          return [];
        }
      })
    );

    // Aplanar resultados
    auditResults.forEach((fileViolations) => {
      allViolations.push(...fileViolations);
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
