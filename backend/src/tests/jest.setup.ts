// Configuración global para inyectar variables de entorno críticas en Jest.
// Esto previene que el módulo src/config/env.ts lance excepciones (Fail-Fast)
// al inicializar el entorno de test, ya que los tests no cargan el archivo .env

process.env.REDIS_URL = "redis://localhost:6379/mock-test";
