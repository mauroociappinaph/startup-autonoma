import { execSync, spawn } from "child_process";

/**
 * QUICK COMMIT: La vía rápida pero segura.
 * Implementa staging selectivo para evitar el `git add .` indiscriminado.
 * Solo stagea archivos trackeados modificados y nuevos no ignorados.
 */

/**
 * Detecta si ya hay archivos en el index (staged manualmente por el usuario).
 */
function hasManuallyStagedFiles(): boolean {
  try {
    const staged = execSync("git diff --cached --name-only", { encoding: "utf-8" }).trim();
    return staged.length > 0;
  } catch {
    return false;
  }
}

/**
 * Obtiene la lista de archivos a stagear:
 * - Archivos trackeados modificados/añadidos/renombrados (no ignorados)
 * - Archivos nuevos no ignorados (untracked, pero respetando .gitignore)
 */
function getFilesToStage(): string[] {
  // Archivos trackeados modificados, añadidos, copiados o renombrados
  const modified = execSync("git diff --name-only --diff-filter=ACMR", { encoding: "utf-8" })
    .trim()
    .split("\n")
    .filter(Boolean);

  // Archivos nuevos sin trackear que NO están en .gitignore
  const untracked = execSync("git ls-files --others --exclude-standard", { encoding: "utf-8" })
    .trim()
    .split("\n")
    .filter(Boolean);

  return [...new Set([...modified, ...untracked])];
}

async function run() {
  const commitMsg = process.argv[2];

  if (!commitMsg) {
    console.error("🚨 Error: Falta el mensaje del commit.");
    console.log('Uso: npm run commit -- "feat(scope): mi mensaje"');
    process.exit(1);
  }

  console.log("==========================================================");
  console.log("🏎️  ANTIGRAVITY: Quick Commit Mode");
  console.log("==========================================================");

  try {
    // 1. Staging selectivo y seguro
    if (hasManuallyStagedFiles()) {
      console.log("📦 Se detectaron archivos ya staged. Respetando el index actual...");
    } else {
      const filesToStage = getFilesToStage();

      if (filesToStage.length === 0) {
        console.log("⚠️  No hay archivos modificados para stagear. ¿Ya commiteaste todo?");
        process.exit(0);
      }

      console.log(`📦 Stageando ${filesToStage.length} archivo(s):`);
      filesToStage.forEach((f) => console.log(`   + ${f}`));

      execSync(`git add -- ${filesToStage.map((f) => `"${f}"`).join(" ")}`);
    }

    // 2. Ejecutar validaciones en paralelo para ahorrar tiempo
    console.log("🔍 Ejecutando validaciones en paralelo (Laws + Types)...");

    const startTime = Date.now();

    const runTask = (cmd: string, args: string[]) => {
      return new Promise<void>((resolve, reject) => {
        const p = spawn(cmd, args, { stdio: "inherit", shell: true });
        p.on("close", (code) => {
          if (code === 0) resolve();
          else reject(new Error(`Comando falló: ${cmd} ${args.join(" ")}`));
        });
      });
    };

    await Promise.all([
      runTask("npm", ["run", "check-laws"]),
      runTask("npx", ["turbo", "run", "check", "--filter=[HEAD]"]),
    ]);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Validaciones completadas en ${duration}s.`);

    // 3. Commit final con --no-verify para saltar el Husky redundante
    console.log("📝 Commiteando...");
    execSync(`git commit -m "${commitMsg}" --no-verify`, { stdio: "inherit" });

    console.log("\n🚀 ¡Listo! Commit realizado con éxito en tiempo récord.");
  } catch (error) {
    console.error("\n❌ Error durante el Quick Commit. El commit no se realizó.");
    process.exit(1);
  }
}

run();
