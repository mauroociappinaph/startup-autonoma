import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const MAX_LINES = 300;
let errors = 0;

// Ley de Integridad Estructural: Cada paquete debe tener su propia configuración
function checkStructuralIntegrity() {
  const PACKAGES = ['backend', 'frontend'];
  PACKAGES.forEach(pkg => {
    const tsconfigPath = path.join(process.cwd(), pkg, 'tsconfig.json');
    if (!fs.existsSync(tsconfigPath)) {
      console.error(`🚨 [LEY DE INTEGRIDAD ROTA]: El paquete '${pkg}' no tiene un tsconfig.json. Esto rompe el aislamiento del monorepo.`);
      errors++;
    }
  });
}

// Directorios a ignorar
const IGNORE_DIRS = ['node_modules', 'dist', '.git', '.next', '.husky', '.github', '.venv', 'venv'];

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      if (!IGNORE_DIRS.includes(f)) walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

function checkSacredLaws(filePath) {
  // Ignorar archivos que no sean código puro o documentación
  if (filePath.endsWith('.json') || filePath.endsWith('.lock') || filePath.endsWith('.md')) return;

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // LEY #3: Límite de Archivo (Máximo 300 líneas)
  if (lines.length > MAX_LINES) {
    console.error(`🚨 [LEY #3 ROTA]: ${filePath} tiene ${lines.length} líneas (Máximo ${MAX_LINES}). Refactoriza y divide.`);
    errors++;
  }

  // Análisis exclusivo para TypeScript
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    const isInsideTypesFolder = filePath.includes('/types/');
    const isNodeFile = filePath.includes('/nodes/');

    // LEY #8: Reasoning-First (Obligatorio en Nodos del Backend)
    if (isNodeFile && content.includes('Schema = z.object({')) {
      if (!content.includes('reasoning:')) {
        console.error(`🚨 [LEY #8 ROTA]: El nodo ${filePath} define un esquema Zod sin el campo 'reasoning'. Prohibido ejecutar sin justificación.`);
        errors++;
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // LEY #7 (v1): Types de TypeScript siempre van en /types
      if (!isInsideTypesFolder && (line.includes('export interface ') || line.includes('export type '))) {
        console.error(`🚨 [LEY #7 ROTA]: ${filePath}:${i + 1} exporta un tipo o interfaz fuera de la carpeta /types.`);
        errors++;
      }

      // LEY #10: Path Aliases (Prohibidas las relativas complejas)
      if (line.match(/import\s+.*from\s+['"]\.\.\/\.\.\//)) {
         console.error(`🚨 [LEY #10 ROTA]: ${filePath}:${i + 1} usa un import relativo muy profundo ('../../'). Usa los Path Aliases configurados ('@/...') para ayudar a las IAs.`);
         errors++;
      }

      // LEY #5: No Any (Tolerancia Cero en código productivo)
      if (!filePath.includes('.test.ts') && line.includes(': any') && !line.includes('eslint-disable')) {
        console.error(`🚨 [LEY #5 ROTA]: ${filePath}:${i + 1} utiliza 'any'. El tipado debe ser estricto.`);
        errors++;
      }

      // LEY #11: Anti-Extensiones (Prohibido .js solo en el frontend, el backend lo requiere para ESM)
      if (filePath.includes('/frontend/')) {
        const jsImportMatch = line.match(/from\s+['"](.+?\.js)['"]/);
        if (jsImportMatch) {
          console.error(`🚨 [LEY #11 ROTA]: ${filePath}:${i + 1} Import con extensión .js detectado: "${jsImportMatch[1]}". En Next.js omití la extensión.`);
          errors++;
        }
      }
    }
  }
}

// Iniciar auditoría
checkStructuralIntegrity();

// Recolección de archivos a auditar
let filesToAudit = [];

if (process.env.CI) {
  console.log('📡 Entorno CI detectado: Escaneando todo el proyecto...');
  walkDir(process.cwd(), (fsPath) => {
    if (fsPath.endsWith('.ts') || fsPath.endsWith('.tsx') || fsPath.endsWith('.py')) {
      filesToAudit.push(fsPath);
    }
  });
} else {
  console.log('🔍 Auditando cumplimiento de Leyes Sagradas en archivos Staged o Directos...\n');
  try {
    // Si se pasa un argumento, auditar ese archivo específico, sino usar git diff
    const targetFile = process.argv[2];
    if (targetFile) {
       filesToAudit = [path.resolve(process.cwd(), targetFile)];
    } else {
      const diffOutput = execSync('git diff --cached --name-only --diff-filter=ACMR', { 
        encoding: 'utf-8',
        env: { ...process.env, PATH: '/usr/local/bin:/usr/bin:/bin' }
      });
      filesToAudit = diffOutput.split('\n').filter(Boolean).map(f => path.resolve(process.cwd(), f));
    }
  } catch (error) {
    console.error("No se pudo obtener la lista de archivos modificados desde Git:", error.message);
    process.exit(1);
  }
}

if (filesToAudit.length === 0) {
  console.log('✅ No hay archivos para auditar. Adelante.');
  process.exit(0);
}

filesToAudit.forEach(file => {
  if (fs.existsSync(file) && fs.statSync(file).isFile()) {
    checkSacredLaws(file);
  }
});

if (errors > 0) {
  console.error(`\n❌ Se encontraron ${errors} infracciones a la arquitectura en los archivos a subir.`);
  process.exit(1);
} else {
  console.log('✅ Todas las Leyes Sagradas (incluyendo la nueva LEY #11) se cumplen a rajatabla.');
}
