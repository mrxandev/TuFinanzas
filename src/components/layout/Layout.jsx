import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export const Layout = () => {
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleSidebar = () => {
    setIsMinimized((prev) => !prev);
  };

  return (
    <div className="h-screen h-dvh bg-base-100 text-base-content flex flex-col overflow-hidden">
      {/* Topbar fijo con botón para minimizar/expandir Sidebar */}
      <Navbar onToggleSidebar={toggleSidebar} isMinimized={isMinimized} />

      {/* Área de contenido con Sidebar minimizable a modo de iconos */}
      <div className="flex flex-1 overflow-hidden min-h-0 relative">
        <div
          className={`transition-all duration-300 ease-in-out shrink-0 border-r border-base-200 ${
            isMinimized ? "w-20" : "w-64"
          }`}
        >
          <Sidebar isMinimized={isMinimized} />
        </div>

        <main className="flex-1 p-6 sm:p-8 overflow-y-auto bg-base-100 min-h-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
