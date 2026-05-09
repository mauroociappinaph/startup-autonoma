import { jest } from "@jest/globals";
import { createRedisMock } from "./mocks/redis.js";

// Configuración global para inyectar variables de entorno críticas en Jest.
process.env.REDIS_URL = "redis://localhost:6379/0";

// Inyectamos el mock global de Redis para que esté disponible en todos los tests
jest.mock("ioredis", () => createRedisMock());
