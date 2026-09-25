import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export const Layout = () => {
  return (
    <div className="min-h-screen bg-base-200 text-base-content flex flex-col p-3 gap-3">
      {/* Topbar flotante independiente */}
      <Navbar />

      {/* Área de contenido con Sidebar siempre abierto y panel principal */}
      <div className="flex flex-1 gap-3 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto bg-base-100 border border-base-300 rounded-xl shadow-sm">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
