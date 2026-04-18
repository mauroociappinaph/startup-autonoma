#!/usr/bin/env node

/**
 * script: check-docker.js
 * Objetivo: Validar que el ecosistema Docker esté vivo y respondiendo.
 * Estilo: Rioplatense / Antigravity
 */

import { execSync } from "child_process";
import path from "path";

const log = (msg) => console.log(`[ANTIGRAVITY] 🛡️  ${msg}`);
const error = (msg) => {
  console.error(`[ANTIGRAVITY] ❌ ${msg}`);
  process.exit(1);
};

log("Chequeando que el Docker esté arriba, no seas vago...");

try {
  // 1. Verificar si el demonio de Docker está corriendo
  execSync("docker info", { stdio: "ignore" });
  log("Docker Engine está activo. Bien ahí, loco.");

  // 2. Verificar si el docker-compose está instalado
  const composeVersion = execSync("docker-compose --version").toString().trim();
  log(`Usando ${composeVersion}. Fantástico.`);

  // 3. Chequear el estado de los servicios
  log("Escaneando contenedores activos...");
  const status = execSync("docker-compose ps --format json").toString();
  
  if (!status || status.trim() === "[]" || status.trim() === "") {
    log("No hay contenedores corriendo. ¿Te olvidaste del docker-compose up?");
    process.exit(0); // No es error crítico si solo estamos chequeando, pero avisamos.
  }

  const containers = JSON.parse(status);
  const total = containers.length;
  const running = containers.filter(c => c.State === "running" || c.Status.includes("Up")).length;

  if (running < total) {
    error(`Tenés ${total - running} contenedores caídos de ${total}. ¡Ponete las pilas!`);
  }

  log(`Todo en orden. ${running}/${total} servicios operativos. Es una locura cósmica.`);

} catch (err) {
  error("Docker no responde o no está instalado. Sin Docker no hay paraíso, instalalo y volvé.");
}
