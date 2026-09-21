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

export const Sidebar = ({ isCollapsed }) => {
  const { isAdmin } = useAuth();

  const menuItems = [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "Transacciones", path: "/transacciones", icon: ArrowRightLeft },
    { label: "Catálogos", path: "/catalogos", icon: FolderKanban },
    { label: "Cortes Mensuales", path: "/cortes", icon: CalendarCheck },
    { label: "Consultas", path: "/consultas", icon: Search },
    { label: "Reportes Analíticos", path: "/reportes", icon: BarChart3 },
  ];

  if (isAdmin) {
    menuItems.push({ label: "Gestión Usuarios", path: "/usuarios", icon: Users });
  }

  menuItems.push({ label: "Mi Perfil", path: "/perfil", icon: User });

  return (
    <aside
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } bg-base-100 border border-base-300 rounded-xl p-3 shadow-sm flex flex-col justify-between transition-all duration-200 h-full`}
    >
      <ul className="menu menu-md w-full gap-1 p-0">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-3 rounded-lg font-medium transition-colors ${
                    isCollapsed ? "justify-center px-0" : "px-4"
                  } ${
                    isActive
                      ? "bg-primary text-primary-content font-semibold"
                      : "hover:bg-base-200 text-base-content"
                  }`
                }
                title={isCollapsed ? item.label : ""}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};
