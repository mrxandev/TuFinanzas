import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { LogOut, User, Shield, Wallet, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeSelector } from "../ThemeSelector";

export const Navbar = ({ onToggleSidebar, isMinimized }) => {
  const { user, logout } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState(null); // 'profile' | null
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        if (activeDropdown === "profile") {
          setActiveDropdown(null);
        }
      }
    };

    if (activeDropdown === "profile") {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown]);

  return (
    <header className="navbar shrink-0 bg-base-100 border-b border-base-200 px-6 h-16 z-30 w-full justify-between">
      <div className="flex items-center gap-3">
        {/* Botón para minimizar/expandir el Sidebar */}
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="btn btn-ghost btn-circle btn-sm text-base-content/70 hover:text-primary transition-colors"
            title={isMinimized ? "Expandir menú lateral" : "Minimizar menú lateral"}
          >
            {isMinimized ? (
              <PanelLeftOpen className="w-5 h-5 text-primary" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
        )}

        <span className="font-bold text-xl tracking-tight text-primary flex items-center gap-2">
          <Wallet className="w-6 h-6 text-primary" />
          TuFinanzas
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Selector de temas daisyUI */}
        <ThemeSelector />

        {/* Menú de Perfil */}
        <div ref={profileRef} className="relative inline-block text-left">
          <button
            type="button"
            onClick={() =>
              setActiveDropdown((prev) => (prev === "profile" ? null : "profile"))
            }
            className="btn btn-ghost btn-circle avatar border border-base-300"
            title="Mi Perfil"
            aria-label="Abrir menú de usuario"
            aria-expanded={activeDropdown === "profile"}
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
              {user?.nombre?.charAt(0).toUpperCase() || "U"}
            </div>
          </button>

          {activeDropdown === "profile" && (
            <div
              className="absolute right-0 top-full mt-2 bg-base-100 border border-base-300 rounded-2xl z-50 w-56 p-2 shadow-2xl flex flex-col"
              style={{ transform: "none" }}
            >
              <div className="px-4 py-2 border-b border-base-200">
                <span className="block font-semibold text-base-content truncate">
                  {user?.nombre}
                </span>
                <span className="block text-xs text-base-content/60 truncate">
                  {user?.email}
                </span>
                <span className="badge badge-sm badge-secondary mt-1 flex items-center gap-1 w-fit">
                  <Shield className="w-3 h-3" /> {user?.role}
                </span>
              </div>

              <ul className="menu menu-sm p-1 mt-1">
                <li>
                  <Link
                    to="/perfil"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center gap-2 py-2"
                  >
                    <User className="w-4 h-4" /> Mi Perfil
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDropdown(null);
                      logout();
                    }}
                    className="text-error flex items-center gap-2 py-2"
                  >
                    <LogOut className="w-4 h-4" /> Cerrar Sesión
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
