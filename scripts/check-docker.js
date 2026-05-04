#!/usr/bin/env node

/**
 * check-docker.js
 * Valida que el ecosistema Docker esté vivo y respondiendo.
 * Se usa como hook de pre-push en Husky.
 */

import { execSync } from "child_process";
import { request } from "http";
import net from "net";

const isStrict = process.argv.includes("--strict");
const isQuick = process.argv.includes("--quick");

const log  = (msg) => console.log(`[DOCKER] ✅ ${msg}`);
const warn = (msg) => console.warn(`[DOCKER] ⚠️  ${msg}`);
const fail = (msg) => { 
  console.error(`[DOCKER] ❌ ${msg}`); 
  if (isStrict) {
    process.exit(1); 
  } else {
    warn("Continuando porque no estamos en modo --strict...");
  }
};

/**
 * Verifica una conexión TCP básica.
 */
function checkTcpConnection(port, label) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = 2000;

    socket.setTimeout(timeout);
    socket.once("connect", () => {
      socket.destroy();
      log(`${label} TCP :${port} está abierto.`);
      resolve(true);
    });

    socket.once("timeout", () => {
      socket.destroy();
      warn(`${label} TCP :${port} timeout.`);
      resolve(false);
    });

    socket.once("error", () => {
      socket.destroy();
      warn(`${label} TCP :${port} rechazado.`);
      resolve(false);
    });

    socket.connect(port, "127.0.0.1");
  });
}

// -------------------------------------------------------
// 1. Verificar el daemon de Docker
// -------------------------------------------------------
try {
  execSync("docker info", { stdio: "ignore" });
  log("Docker Engine está activo.");
} catch {
  warn("Docker no está corriendo. Saltando chequeo de contenedores...");
  process.exit(0); // No bloqueamos si no hay Docker local
}

// -------------------------------------------------------
// 2. Verificar que docker compose esté disponible
// -------------------------------------------------------
try {
  execSync("docker compose version", { stdio: "ignore" });
} catch {
  warn("docker compose no está disponible. Saltando chequeo de servicios.");
  process.exit(0);
}

// -------------------------------------------------------
// 3. Chequear el estado de los servicios vía docker compose ps
// -------------------------------------------------------
log("Escaneando contenedores activos...");

let containers = [];
try {
  const raw = execSync("docker compose ps --format json").toString().trim();
  if (!raw || raw === "[]" || raw === "") {
    warn("No hay contenedores corriendo.");
    if (isStrict) fail("Se requiere que la infraestructura esté arriba en modo estricto.");
    process.exit(0);
  }
  
  // Docker Compose V2 puede devolver una lista de objetos o NDJSON
  if (raw.startsWith("[")) {
    containers = JSON.parse(raw);
  } else {
    containers = raw.split("\n").filter(Boolean).map(line => JSON.parse(line));
  }
} catch (e) {
  warn(`Error parseando Docker Compose ps: ${e.message}`);
  if (isStrict) fail("Error crítico de validación de infraestructura.");
  process.exit(0);
}

const total   = containers.length;
const running = containers.filter(c => c.State === "running" || (c.Status || "").toLowerCase().includes("up")).length;
const unhealthy = containers.filter(c => (c.Status || "").toLowerCase().includes("unhealthy")).length;

if (unhealthy > 0) {
  fail(`${unhealthy} contenedor(es) en estado UNHEALTHY.`);
}

if (running < total) {
  fail(`Tenés ${total - running} contenedores caídos de ${total}.`);
}

log(`Docker Compose: ${running}/${total} servicios en pie.`);

// -------------------------------------------------------
// 3.5 Verificar conectividad TCP para servicios críticos
// -------------------------------------------------------
if (!isQuick) {
  log("Verificando conectividad TCP para servicios críticos...");
  const dbOk = await checkTcpConnection(5432, "Postgres");
  const redisOk = await checkTcpConnection(6379, "Redis");
  const aiEngineOk = await checkTcpConnection(50051, "AI Engine (gRPC)");

  if (!dbOk || !redisOk || !aiEngineOk) {
    fail("Fallo de conectividad TCP en servicios base.");
  }
}

// -------------------------------------------------------
// 4. Verificar que el backend y frontend responden vía HTTP
// -------------------------------------------------------
const backendPort = process.env.BACKEND_PORT || 4000;

function checkHttpHealth(port, path, label) {
  return new Promise((resolve) => {
    const req = request({ host: "localhost", port, path, method: "GET" }, (res) => {
      if (res.statusCode === 200) {
        log(`${label} responde OK en :${port}${path}`);
        resolve(true);
      } else {
        warn(`${label} devolvió status ${res.statusCode}.`);
        resolve(false);
      }
    });
    req.on("error", () => {
      warn(`${label} no responde en :${port}${path}.`);
      resolve(false);
    });
    req.setTimeout(3000, () => { req.destroy(); resolve(false); });
    req.end();
  });
}

if (!isQuick) {
  const backendOk  = await checkHttpHealth(backendPort, "/health", "Backend");
  const frontendOk = await checkHttpHealth(3000, "/", "Frontend");

  if (!backendOk || !frontendOk) {
    fail("Algunos servicios web no responden.");
  }
}

log("Verificación de Docker finalizada. ¡Dale que va!");

