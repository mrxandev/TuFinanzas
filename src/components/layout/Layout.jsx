import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content flex flex-col p-3 gap-3">
      {/* Topbar flotante independiente */}
      <Navbar onToggleSidebar={toggleSidebar} isSidebarCollapsed={sidebarCollapsed} />

      {/* Área de contenido con Sidebar y panel principal separados por gap */}
      <div className="flex flex-1 gap-3 overflow-hidden">
        <Sidebar isCollapsed={sidebarCollapsed} />
        <main className="flex-1 p-6 overflow-y-auto bg-base-100 border border-base-300 rounded-xl shadow-sm transition-all duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
