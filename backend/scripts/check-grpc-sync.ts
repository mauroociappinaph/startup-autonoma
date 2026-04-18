import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../../');
const PROTO_PATH = path.resolve(ROOT_DIR, 'protos/ai_engine.proto');
const PY_GEN_PATH = path.resolve(ROOT_DIR, 'ai-engine/app/grpc_generated/ai_engine_pb2.py');
const TS_CLIENT_PATH = path.resolve(ROOT_DIR, 'backend/src/services/aiEngineClient.ts');

/**
 * Script de validación de sincronización gRPC.
 * Detecta desincronizaciones entre el contrato (.proto) y las implementaciones.
 */
function validateGrpcSync() {
  console.log("🔍 [CHECK] Iniciando validación de sincronización gRPC...");

  // 1. Validar existencia de archivos
  if (!fs.existsSync(PROTO_PATH)) {
    console.error("❌ ERROR: No se encuentra el archivo .proto en " + PROTO_PATH);
    process.exit(1);
  }

  if (!fs.existsSync(PY_GEN_PATH)) {
    console.warn("⚠️  WARNING: No se encuentran archivos generados en Python (ai-engine).");
  }

  // 2. Validar coherencia entre .proto y Cliente TS
  const protoContent = fs.readFileSync(PROTO_PATH, 'utf-8');
  const tsContent = fs.readFileSync(TS_CLIENT_PATH, 'utf-8');

  // Extraer rpc methods del proto
  const rpcMethods = [...protoContent.matchAll(/rpc\s+(\w+)\s*\(/g)].map(m => m[1]);

  console.log(`📋 Métodos detectados en el .proto: ${rpcMethods.join(', ')}`);

  // Verificar que el cliente TS use estos métodos
  let hasError = false;
  rpcMethods.forEach(method => {
    if (!tsContent.includes(method)) {
      console.warn(`⚠️  ALERTA: El método '${method}' está en el .proto pero no parece usarse en aiEngineClient.ts`);
    } else {
      console.log(`✅ Método '${method}' sincronizado en TS Client.`);
    }
  });

  // Verificar que el cliente TS no llame métodos inexistentes (dentro de lo posible con regex)
  const tsCalls = [...tsContent.matchAll(/\.client\.(\w+)\(/g)].map(m => m[1]);
  tsCalls.forEach(call => {
    if (!rpcMethods.includes(call)) {
      console.error(`❌ ERROR: El cliente TS intenta llamar a '${call}', pero no existe en el .proto!`);
      hasError = true;
    }
  });

  if (hasError) {
    console.error("❌ Falló la validación de sincronización gRPC.");
    process.exit(1);
  }

  console.log("✨ [OK] gRPC Sync Check completado exitosamente.");
}

validateGrpcSync();
