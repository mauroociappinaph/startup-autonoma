import { execSync, spawn } from "child_process";
import path from "path";

/**
 * QUICK COMMIT: La vía rápida pero segura.
 * Ejecuta validaciones en paralelo y usa --no-verify para evitar doble validación de Husky.
 */

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
    // 1. Stage de archivos
    console.log("📦 Staging files...");
    execSync("git add .");

    // 2. Ejecutar validaciones en paralelo para ahorrar tiempo
    console.log("🔍 Ejecutando validaciones en paralelo (Laws + Types)...");
    
    const startTime = Date.now();

    // Promisify spawn para manejo de procesos paralelos con salida en vivo
    const runTask = (cmd: string, args: string[]) => {
      return new Promise<void>((resolve, reject) => {
        const p = spawn(cmd, args, { stdio: "inherit", shell: true });
        p.on("close", (code) => {
          if (code === 0) resolve();
          else reject(new Error(`Comando falló: ${cmd} ${args.join(" ")}`));
        });
      });
    };

    // Lanzamos Leyes de Arquitectura y Chequeo de Tipos de Turbo
    // check-laws ya es inteligente y solo audita archivos staged localmente
    await Promise.all([
      runTask("npm", ["run", "check-laws"]),
      runTask("npx", ["turbo", "run", "check", "--filter=[HEAD]"])
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
