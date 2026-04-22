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

  // Análisis exclusivo para TypeScript/TSX
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    // Saltamos archivos de test para todas las leyes de arquitectura
    if (filePath.includes('.test.ts')) return;

    const isNodeFile = filePath.includes('/nodes/');

    // LEY #3: Límites de Archivo (Máximo 300 líneas)
    const lineCount = lines.length;
    if (lineCount > MAX_LINES) {
      console.error(`🚨 [LEY #3 ROTA]: El archivo ${filePath} tiene ${lineCount} líneas (Máximo ${MAX_LINES}).`);
      errors++;
    }

    // LEY #5: Tipado Estricto (No Any)
    lines.forEach((line, index) => {
      if (line.includes(': any') && !line.includes('eslint-disable')) {
        console.error(`🚨 [LEY #5 ROTA]: Uso de 'any' en ${filePath}:${index + 1}.`);
        errors++;
      }
    });

    // LEY #7: Ubicación de Contratos/Tipos
    if (!filePath.includes('/types/') && !filePath.includes('/contracts/') && !filePath.includes('/state/')) {
      if (content.includes('export interface ') || content.includes('export type ')) {
         console.error(`🚨 [LEY #7 ROTA]: Se detectó exportación de tipos en ${filePath}. Deben ir en /types o /contracts.`);
         errors++;
      }
    }

    // LEY #8: Reasoning-First (Obligatorio en Nodos del Backend)
    if (isNodeFile && (content.includes('Schema = z.object({') || content.includes('Schema = z.enum(['))) {
      if (!content.includes('reasoning:')) {
        console.error(`🚨 [LEY #8 ROTA]: El nodo ${filePath} define un esquema de respuesta sin el campo 'reasoning'.`);
        errors++;
      }
    }

    // LEY #10: Path Aliases Obligatorios
    lines.forEach((line, index) => {
      if (line.includes('from "../../') || line.includes("from '../../")) {
        console.error(`🚨 [LEY #10 ROTA]: Import relativo profundo detectado en ${filePath}:${index + 1}. Usa path aliases (@/).`);
        errors++;
      }
    });

    // LEY #11: Anti-Extensiones (Frontend) - Ya no se necesitan .js en Next.js 15
    if (filePath.includes('/frontend/src/')) {
      lines.forEach((line, index) => {
        if (line.includes("from '") || line.includes('from "')) {
          if (line.includes('.js') || line.includes('.ts')) {
             console.error(`🚨 [LEY #11 ROTA]: Extensión de archivo detectada en import en ${filePath}:${index + 1}. Omití .js/.ts.`);
             errors++;
          }
        }
      });
    }

    // LEY #13: Strict-XML-Formatting (System Prompts)
    if (isNodeFile && content.includes('SystemMessage(`')) {
      const requiredTags = ['<thought>', '<plan>', '<verification>'];
      requiredTags.forEach(tag => {
        if (!content.includes(tag)) {
          console.error(`🚨 [LEY #13 ROTA]: El SystemMessage en ${filePath} no incluye el tag obligatorio ${tag}.`);
          errors++;
        }
      });
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
  console.error(`\n❌ Se encontraron ${errors} infracciones a la arquitectura.`);
  process.exit(1);
} else {
  console.log('✅ Todas las Leyes Sagradas se cumplen a rajatabla.');
}
