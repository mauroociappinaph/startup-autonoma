import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const MAX_LINES = 300;

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

// Correr integridad antes del resto
checkStructuralIntegrity();

// Directorios a ignorar
const IGNORE_DIRS = ['node_modules', 'dist', '.git', '.next', '.husky', '.github'];

let errors = 0;

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

  // Regla 3: Límite de Archivo (Máximo 300 líneas)
  if (lines.length > MAX_LINES) {
    console.error(`🚨 [LEY #3 ROTA]: ${filePath} tiene ${lines.length} líneas (Máximo ${MAX_LINES}). Refactoriza y divide.`);
    errors++;
  }

  // Análisis exclusivo para TypeScript
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    const isInsideTypesFolder = filePath.includes('/types/');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Regla 7: Types de TypeScript siempre van en /types
      if (!isInsideTypesFolder && (line.includes('export interface ') || line.includes('export type '))) {
        console.error(`🚨 [LEY #7 ROTA]: ${filePath}:${i + 1} exporta un tipo o interfaz fuera de la carpeta /types.`);
        errors++;
      }

      // Regla 10: Path Aliases (Prohibidas las relativas complejas)
      // Buscamos imports espagueti estilo import x from '../../../../algo'
      if (line.match(/import\s+.*from\s+['"]\.\.\/\.\.\//)) {
         console.error(`🚨 [LEY #10 ROTA]: ${filePath}:${i + 1} usa un import relativo muy profundo ('../../'). Usa los Path Aliases configurados ('@/...') para ayudar a las IAs.`);
         errors++;
      }
    }
  }
}

// Recolección de archivos a auditar
let filesToAudit = [];

if (process.env.CI) {
  console.log('📡 Entorno CI detectado: Escaneando todo el proyecto...');
  walkDir(process.cwd(), (fsPath) => {
    // Solo auditamos archivos de código fuente relevantes
    if (fsPath.endsWith('.ts') || fsPath.endsWith('.tsx') || fsPath.endsWith('.py')) {
      filesToAudit.push(fsPath);
    }
  });
} else {
  console.log('🔍 Auditando cumplimiento de Leyes Sagradas en archivos Staged...\n');
  try {
    const diffOutput = execSync('git diff --cached --name-only --diff-filter=ACMR', { 
      encoding: 'utf-8',
      env: { ...process.env, PATH: '/usr/local/bin:/usr/bin:/bin' }
    });
    filesToAudit = diffOutput.split('\n').filter(Boolean).map(f => path.resolve(process.cwd(), f));
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
  console.log('✅ Todas las Leyes Sagradas se cumplen a rajatabla en tu commit.');
}
