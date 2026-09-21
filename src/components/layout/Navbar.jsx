import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { LogOut, User, Shield, AlertTriangle, Wallet, Menu } from "lucide-react";
import { Link } from "react-router-dom";

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [limiteInfo, setLimiteInfo] = useState(null);

  /* Carga información sobre el límite de gasto del usuario */
  useEffect(() => {
    if (user?.id) {
      api.get(`/usuarios/${user.id}/limite-status`)
        .then((res) => setLimiteInfo(res.data.data))
        .catch(() => setLimiteInfo(null));
    }
  }, [user]);

  return (
    <header className="navbar bg-base-100 border border-base-300 rounded-xl px-4 shadow-sm z-30 min-h-14">
      <div className="flex-1 gap-3">
        {/* Botón para colapsar / desplegar menú lateral */}
        <button
          onClick={onToggleSidebar}
          className="btn btn-ghost btn-square btn-sm text-base-content/80 hover:text-primary"
          title="Desplegar / Minimizar Menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="font-bold text-xl tracking-tight text-primary flex items-center gap-2">
          <Wallet className="w-6 h-6 text-primary" />
          TuFinanzas
        </span>

        {/* Badge indicador rápido de consumo de límite */}
        {limiteInfo && (
          <div className="hidden md:flex items-center gap-2 ml-4">
            <div
              className={`badge badge-lg gap-1 font-medium ${
                limiteInfo.supero_limite
                  ? "badge-error text-white"
                  : limiteInfo.porcentaje_consumido > 80
                  ? "badge-warning"
                  : "badge-outline badge-primary"
              }`}
            >
              {limiteInfo.supero_limite && <AlertTriangle className="w-4 h-4" />}
              <span>Límite: {limiteInfo.porcentaje_consumido}%</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-none gap-3">
        {/* Información y Menú desplegable de Perfil */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar border border-base-300">
            <div className="w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
              {user?.nombre?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-base-100 rounded-box w-56 border border-base-200"
          >
            <li className="menu-title px-4 py-2 border-b border-base-200">
              <span className="font-semibold text-base-content">{user?.nombre}</span>
              <span className="text-xs text-base-content/60">{user?.email}</span>
              <span className="badge badge-sm badge-secondary mt-1 flex items-center gap-1 w-fit">
                <Shield className="w-3 h-3" /> {user?.role}
              </span>
            </li>
            <li className="mt-2">
              <Link to="/perfil" className="flex items-center gap-2">
                <User className="w-4 h-4" /> Mi Perfil
              </Link>
            </li>
            <li>
              <button onClick={logout} className="text-error flex items-center gap-2">
                <LogOut className="w-4 h-4" /> Cerrar Sesión
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};
