import { execSync } from 'child_process';
import { readdirSync } from 'fs';
import { join } from 'path';

const testDirs = ['src/tests', 'src/nodes/workers', 'src/nodes/chiefs', 'src/graph'];
const testFiles: string[] = [];

for (const dir of testDirs) {
  try {
    const files = readdirSync(join(process.cwd(), dir))
      .filter(f => f.endsWith('.test.ts'))
      .map(f => join(dir, f));
    testFiles.push(...files);
  } catch (e) {
    // Ignore missing dirs
  }
}

console.log(`Found ${testFiles.length} test files.`);

for (const file of testFiles) {
  console.log(`\n--- Testing ${file} ---`);
  try {
    const start = Date.now();
    execSync(`NODE_OPTIONS='--experimental-vm-modules' npx jest --detectOpenHandles ${file}`, { 
      stdio: 'inherit',
      timeout: 30000 // 30 seconds timeout per file
    });
    const duration = Date.now() - start;
    console.log(`✅ ${file} passed in ${duration}ms`);
  } catch (e: any) {
    if (e.code === 'ETIMEDOUT') {
      console.error(`❌ ${file} HANGED (timeout reached)`);
    } else {
      console.error(`❌ ${file} FAILED with exit code ${e.status}`);
    }
  }
}
