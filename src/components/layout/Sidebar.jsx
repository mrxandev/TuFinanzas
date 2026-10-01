import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  ArrowRightLeft,
  FolderKanban,
  CalendarCheck,
  Search,
  BarChart3,
  Users,
  User,
} from "lucide-react";

export const Sidebar = ({ isMinimized, onLinkClick }) => {
  const { isAdmin } = useAuth();

  const menuItems = [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "Transacciones", path: "/transacciones", icon: ArrowRightLeft },
    { label: "Cortes Mensuales", path: "/cortes", icon: CalendarCheck },
    { label: "Consultas", path: "/consultas", icon: Search },
    { label: "Reportes Analíticos", path: "/reportes", icon: BarChart3 },
  ];

  if (isAdmin) {
    menuItems.push({ label: "Catálogos Maestros", path: "/catalogos", icon: FolderKanban });
    menuItems.push({ label: "Gestión Usuarios", path: "/usuarios", icon: Users });
  }

  menuItems.push({ label: "Mi Perfil", path: "/perfil", icon: User });

  return (
    <aside
      className={`h-full bg-base-100 flex flex-col justify-between transition-all duration-300 ${
        isMinimized ? "w-20 p-2 overflow-visible" : "w-64 p-4 overflow-y-auto"
      }`}
    >
      <ul className="menu menu-md w-full gap-1.5 p-0">
        {menuItems.map((item) => {
          const Icon = item.icon;

          if (isMinimized) {
            return (
              <li key={item.path} className="group relative flex justify-center">
                <NavLink
                  to={item.path}
                  onClick={() => {
                    if (onLinkClick) onLinkClick();
                  }}
                  className={({ isActive }) =>
                    `flex items-center justify-center w-12 h-12 rounded-xl transition-all ${
                      isActive
                        ? "bg-primary text-primary-content font-semibold"
                        : "hover:bg-base-200 text-base-content"
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                </NavLink>

                {/* Floating Speech Bubble / "Palomita" */}
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 ease-out z-50 flex items-center">
                  {/* Left-pointing triangle connector ("palomita") */}
                  <div className="w-0 h-0 border-y-[6px] border-y-transparent border-r-[8px] border-r-base-200 drop-shadow-sm"></div>
                  {/* Badge content */}
                  <div className="bg-base-200 text-base-content text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xl border border-base-300 whitespace-nowrap flex items-center">
                    {item.label}
                  </div>
                </div>
              </li>
            );
          }

          return (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={() => {
                  if (onLinkClick) onLinkClick();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-content font-semibold"
                      : "hover:bg-base-200 text-base-content"
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};
