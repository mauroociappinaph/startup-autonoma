import fs from 'fs';
import path from 'path';

/**
 * Script para generar la estructura del proyecto automáticamente en architecture.md
 */

const IGNORE_LIST = ['node_modules', '.git', 'dist', '.next', '.turbo', '.venv', '__pycache__', 'package-lock.json'];

function generateTree(dir, prefix = '') {
    let tree = '';
    const files = fs.readdirSync(dir)
        .filter(file => !IGNORE_LIST.includes(file))
        .sort((a, b) => {
            const aStat = fs.statSync(path.join(dir, a));
            const bStat = fs.statSync(path.join(dir, b));
            if (aStat.isDirectory() && !bStat.isDirectory()) return -1;
            if (!aStat.isDirectory() && bStat.isDirectory()) return 1;
            return a.localeCompare(b);
        });

    files.forEach((file, index) => {
        const filePath = path.join(dir, file);
        const isDirectory = fs.statSync(filePath).isDirectory();
        const isLast = index === files.length - 1;
        const linePrefix = isLast ? '└── ' : '├── ';

        tree += `${prefix}${linePrefix}${file}${isDirectory ? '/' : ''}\n`;

        if (isDirectory) {
            const childPrefix = isLast ? '    ' : '│   ';
            tree += generateTree(filePath, prefix + childPrefix);
        }
    });

    return tree;
}

const treeContent = generateTree(process.cwd());

const architectureTemplate = `# 🏗️ Proyecto: Startup Autónoma - Arquitectura

## 📜 Principios Fundamentales
1. **Screaming Architecture:** La estructura grita su propósito (Backend Orquestador, Engine IA, Frontend Control).
2. **Jerarquía Estricta:** CEO -> Chiefs -> Workers.
3. **Persistencia Semántica:** Memoria de largo plazo vía Engram (PARA Method).
4. **Calidad de Elite:** Tipado estricto, Leyes Sagradas y Validación en CI/CD.

## 🗺️ Estructura del Repositorio (Actualizada Automáticamente)

\`\`\`text
${treeContent}\`\`\`

---
*Este archivo se actualiza automáticamente en cada commit mediante un hook de Husky.*
`;

fs.writeFileSync('architecture.md', architectureTemplate);
console.log('✅ architecture.md actualizado con éxito.');
