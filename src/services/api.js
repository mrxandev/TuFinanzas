import axios from "axios";
import Swal from "sweetalert2";

/* Configuración central de Axios leyendo la URL base desde .env */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* Interceptor para inyectar Token JWT en cada petición */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("tufinanzas_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* Interceptor de respuestas para manejo centralizado de errores con SweetAlert2 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "Ocurrió un error en el servidor";
    const status = error.response?.status;

    if (status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      
      if (isLoginRequest) {
        Swal.fire({
          icon: "error",
          title: "Error de autenticación",
          text: message || "Credenciales incorrectas",
          confirmButtonColor: "#ef4444",
        });
      } else {
        localStorage.removeItem("tufinanzas_token");
        localStorage.removeItem("tufinanzas_user");
        Swal.fire({
          icon: "warning",
          title: "Sesión Expirada",
          text: "Tu sesión ha expirado. Por favor ingresa nuevamente.",
          confirmButtonColor: "#2563eb",
        }).then(() => {
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        });
      }
    } else if (status === 403) {
      Swal.fire({
        icon: "error",
        title: "Acceso Denegado",
        text: message,
        confirmButtonColor: "#ef4444",
      });
    } else if (status >= 400 && status < 500) {
      Swal.fire({
        icon: "warning",
        title: "Atención",
        text: message,
        confirmButtonColor: "#f59e0b",
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error del Servidor",
        text: message,
        confirmButtonColor: "#ef4444",
      });
    }

    return Promise.reject(error);
  }
);

export default api;
