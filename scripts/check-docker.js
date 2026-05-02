#!/usr/bin/env node

/**
 * check-docker.js
 * Valida que el ecosistema Docker esté vivo y respondiendo.
 * Se usa como hook de pre-push en Husky.
 */

import { execSync } from "child_process";
import { request } from "http";

const log  = (msg) => console.log(`[DOCKER] ✅ ${msg}`);
const warn = (msg) => console.warn(`[DOCKER] ⚠️  ${msg}`);
const fail = (msg) => { console.error(`[DOCKER] ❌ ${msg}`); process.exit(1); };

// -------------------------------------------------------
// 1. Verificar el daemon de Docker
// -------------------------------------------------------
try {
  execSync("docker info", { stdio: "ignore" });
  log("Docker Engine está activo.");
} catch {
  warn("Docker no está corriendo. Saltando chequeo de contenedores...");
  process.exit(0); // No bloqueamos si no hay Docker local (ej: CI sin Docker)
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
    warn("No hay contenedores corriendo. Si es intencional, ignorá este aviso.");
    process.exit(0);
  }
  // docker compose ps --format json puede devolver NDJSON (una línea por servicio)
  containers = raw.split("\n").filter(Boolean).map(line => JSON.parse(line));
} catch {
  warn("No se pudo parsear el estado de Docker Compose. Saltando...");
  process.exit(0);
}

const total   = containers.length;
const running = containers.filter(c => c.State === "running" || (c.Status || "").includes("Up")).length;
const unhealthy = containers.filter(c => (c.Status || "").includes("unhealthy")).length;

if (unhealthy > 0) {
  fail(`${unhealthy} contenedor(es) en estado UNHEALTHY. Revisá los logs con: docker compose logs`);
}

if (running < total) {
  fail(`Tenés ${total - running} contenedores caídos de ${total}. ¡Ponete las pilas!`);
}

log(`Docker Compose: ${running}/${total} servicios en pie.`);

// -------------------------------------------------------
// 3.5 Verificar volúmenes persistentes
// -------------------------------------------------------
log("Verificando volúmenes persistentes...");
try {
  const volumesRaw = execSync("docker volume ls --format json").toString().trim();
  const volumeNames = volumesRaw.split("\n").filter(Boolean).map(line => {
    try {
      return JSON.parse(line).Name;
    } catch {
      return "";
    }
  });

  const requiredVolumes = ["startup-autonoma_redis_data", "startup-autonoma_postgres_data"];
  const missingVolumes = requiredVolumes.filter(v => !volumeNames.some(name => name.includes(v)));

  if (missingVolumes.length > 0) {
    warn(`Faltan volúmenes persistentes: ${missingVolumes.join(", ")}. ¡Ojo que no vas a tener persistencia!`);
  } else {
    log("Volúmenes de persistencia verificados.");
  }
} catch {
  warn("No se pudo verificar los volúmenes de Docker. Saltando...");
}

// -------------------------------------------------------
// 4. Verificar que el backend responde el health endpoint
// -------------------------------------------------------
const backendPort = process.env.BACKEND_PORT || 4000;

function checkHttpHealth(port, path, label) {
  return new Promise((resolve) => {
    const req = request({ host: "localhost", port, path, method: "GET" }, (res) => {
      if (res.statusCode === 200) {
        log(`${label} responde OK en :${port}${path}`);
        resolve(true);
      } else {
        warn(`${label} devolvió status ${res.statusCode}. Puede estar arrancando.`);
        resolve(false);
      }
    });
    req.on("error", () => {
      warn(`${label} no responde en :${port}${path}. ¿Ya levantaste los servicios?`);
      resolve(false);
    });
    req.setTimeout(3000, () => { req.destroy(); resolve(false); });
    req.end();
  });
}

const backendOk  = await checkHttpHealth(backendPort, "/health", "Backend");
const frontendOk = await checkHttpHealth(3000, "/", "Frontend");

if (!backendOk || !frontendOk) {
  warn("Algunos servicios web no responden, pero los contenedores están arriba. Puede ser cold-start.");
  // No bloqueamos: el compose healthcheck se encarga de esto en producción.
}

log("Verificación de Docker finalizada. ¡Dale que va!");

