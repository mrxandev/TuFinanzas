import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Layout } from "./components/layout/Layout";

import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { Transacciones } from "./pages/Transacciones";
import { Catalogos } from "./pages/Catalogos";
import { Cortes } from "./pages/Cortes";
import { Consultas } from "./pages/Consultas";
import { Reportes } from "./pages/Reportes";
import { Usuarios } from "./pages/Usuarios";
import { Perfil } from "./pages/Perfil";

/* Componente Guard para proteger rutas que requieren autenticación */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas Protegidas dentro del Layout principal */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="transacciones" element={<Transacciones />} />
            <Route path="catalogos" element={<Catalogos />} />
            <Route path="cortes" element={<Cortes />} />
            <Route path="consultas" element={<Consultas />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="perfil" element={<Perfil />} />

            {/* Ruta exclusiva para Administradores */}
            <Route
              path="usuarios"
              element={
                <ProtectedRoute adminOnly={true}>
                  <Usuarios />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}