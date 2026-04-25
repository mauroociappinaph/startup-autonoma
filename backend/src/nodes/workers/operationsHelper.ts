/**
 * Lista blanca de comandos permitidos para el Operations Worker.
 */
const ALLOWED_COMMANDS: Record<string, string> = {
  docker_ps: 'docker ps --format "{{.Names}}: {{.Status}}"',
  docker_logs: 'docker logs {args} --tail 50',
  npm_build: 'npm run build',
  check_health: 'curl -s http://localhost:3000/health || echo "Offline"'
};

/**
 * Helper para construir comandos seguros.
 */
export function safeExec(command: keyof typeof ALLOWED_COMMANDS, args: string[] = []): string {
  const template = ALLOWED_COMMANDS[command];
  
  if (!template) {
    throw new Error(`Comando no permitido: ${command}`);
  }

  if (command === 'docker_logs' && args.length > 0) {
    // Sanitización básica: solo permitimos nombres de contenedores alfanuméricos y guiones
    const containerName = args[0].replace(/[^a-zA-Z0-9_-]/g, '');
    return template.replace('{args}', containerName);
  }

  return template;
}
