import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("tufinanzas_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("tufinanzas_token") || null);
  const [loading, setLoading] = useState(true);

  /* Carga inicial del perfil si existe un token guardado */
  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const res = await api.get("/auth/me");
          const userData = res.data.data.usuario || res.data.data;
          setUser(userData);
          localStorage.setItem("tufinanzas_user", JSON.stringify(userData));
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [token]);

  /* Inicio de sesión */
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token: jwtToken, usuario } = res.data.data;
    setToken(jwtToken);
    setUser(usuario);
    localStorage.setItem("tufinanzas_token", jwtToken);
    localStorage.setItem("tufinanzas_user", JSON.stringify(usuario));
    return res.data;
  };

  /* Registro de nuevo usuario */
  const register = async (formData) => {
    const res = await api.post("/auth/register", formData);
    return res.data;
  };

  /* Cierre de sesión */
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("tufinanzas_token");
    localStorage.removeItem("tufinanzas_user");
  };

  /* Actualización local de datos de perfil */
  const updateUserData = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("tufinanzas_user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUserData,
        isAuthenticated: !!token,
        isAdmin: user?.role === "ADMIN",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
