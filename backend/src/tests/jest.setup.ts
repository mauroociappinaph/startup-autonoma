// Configuración global para inyectar variables de entorno críticas en Jest.
// Este archivo NO DEBE tener imports que dependan de las variables inyectadas,
// ya que en ESM los imports se resuelven antes de la ejecución del código.

process.env.REDIS_URL = "redis://localhost:6379/0";
