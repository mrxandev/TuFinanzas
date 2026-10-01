import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export const Layout = () => {
  const [isMinimized, setIsMinimized] = useState(() => window.innerWidth < 768);

  const toggleSidebar = () => {
    setIsMinimized((prev) => !prev);
  };

  return (
    <div className="h-screen h-dvh bg-base-100 text-base-content flex flex-col overflow-hidden">
      {/* Topbar fijo con botón para minimizar/expandir Sidebar */}
      <Navbar onToggleSidebar={toggleSidebar} isMinimized={isMinimized} />

      {/* Área de contenido con Sidebar minimizable a modo de iconos */}
      <div className="flex flex-1 overflow-hidden min-h-0 relative">
        {/* Desktop Sidebar */}
        <div
          className={`hidden md:block transition-all duration-300 ease-in-out shrink-0 border-r border-base-200 ${
            isMinimized ? "w-20 overflow-visible z-20" : "w-64"
          }`}
        >
          <Sidebar isMinimized={isMinimized} />
        </div>

        {/* Mobile Sidebar Overlay */}
        <div 
          className={`md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity ${!isMinimized ? "opacity-100" : "opacity-0 pointer-events-none"}`} 
          onClick={toggleSidebar}
        ></div>

        {/* Mobile Sidebar Drawer */}
        <div 
          className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-base-100 transform transition-transform duration-300 ease-in-out ${!isMinimized ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex justify-end p-2 border-b border-base-200">
            <button onClick={toggleSidebar} className="btn btn-ghost btn-sm btn-circle">
              ✕
            </button>
          </div>
          <Sidebar isMinimized={false} onLinkClick={toggleSidebar} />
        </div>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto bg-base-100 min-h-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
