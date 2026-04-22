import axios from "axios";

/**
 * Cliente base de Axios configurado con el prefijo de la API de Next.js.
 * Centraliza la configuración de headers y timeouts.
 */
export const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para manejar errores globales (opcional pero recomendado)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);
