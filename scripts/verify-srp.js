import fs from 'fs';
import path from 'path';

let errors = 0;

function checkFile(filePath, rules) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  
  rules.forEach(rule => {
    const regex = new RegExp(rule.pattern, 'g');
    if (rule.forbidden && regex.test(content)) {
      console.error(`🚨 [VIOLACIÓN SRP]: ${filePath} -> ${rule.message}`);
      errors++;
    }
    if (rule.mandatory && !regex.test(content)) {
      console.error(`🚨 [FALTA MANDATORIA]: ${filePath} -> ${rule.message}`);
      errors++;
    }
  });
}

// --- REGLAS POR CAPA ---

// 1. Entry Point (index.ts)
const indexRules = [
  { pattern: 'app\\.listen', mandatory: true, message: 'Debe contener el levantamiento del servidor (app.listen).' },
  { pattern: 'graph\\.stream', forbidden: true, message: 'No debe contener lógica de grafos. Delegar a un Service.' },
  { pattern: 'res\\.write|res\\.json', forbidden: true, message: 'No debe manejar respuestas HTTP directamente. Usar Controllers.' }
];

// 2. Routes (src/routes/)
const routeRules = [
  { pattern: 'Router\\(\\)', mandatory: true, message: 'Debe usar express.Router().' },
  { pattern: 'res\\.json|res\\.send|res\\.write', forbidden: true, message: 'No debe manejar la respuesta. Delegar al Controller.' },
  { pattern: 'async\\s*\\(req,\\s*res\\)\\s*=>', forbidden: true, message: 'No usar funciones anónimas inline. Usar métodos del Controller.' }
];

// 3. Controllers (src/controllers/)
const controllerRules = [
  { pattern: 'Request|Response', mandatory: true, message: 'Debe tipar req/res con Request/Response de Express.' },
  { pattern: 'graph\\.stream', forbidden: true, message: 'No debe tocar el grafo directamente. Usar un Service.' },
  { pattern: 'import\\s+.*from\\s+[\'"]express[\'"]', forbidden: false, message: 'Ojo: solo importar tipos de express.' }
];

// 4. Services (src/services/)
const serviceRules = [
  { pattern: 'Response|Request', forbidden: true, message: 'No debe conocer el protocolo HTTP (req/res). Recibir datos limpios.' },
  { pattern: 'import\\s+.*from\\s+[\'"]express[\'"]', forbidden: true, message: 'Prohibido importar express en la capa de servicios.' }
];

// --- EJECUCIÓN ---

console.log('🔍 Validando arquitectura SRP (Routes -> Controllers -> Services)...');

// Validar index
checkFile(path.join(process.cwd(), 'backend/src/index.ts'), indexRules);

// Validar carpetas
const backendSrc = path.join(process.cwd(), 'backend/src');

function walk(dir, rules) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) return;
    if (file.endsWith('.ts')) checkFile(fullPath, rules);
  });
}

walk(path.join(backendSrc, 'routes'), routeRules);
walk(path.join(backendSrc, 'controllers'), controllerRules);
walk(path.join(backendSrc, 'services'), serviceRules);

if (errors > 0) {
  console.error(`\n❌ Se encontraron ${errors} violaciones a la arquitectura SRP.`);
  process.exit(1);
} else {
  console.log('✅ Arquitectura SRP validada y limpia. ¡Así se construye, loco!');
}
