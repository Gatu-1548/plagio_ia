import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header onToggleSidebar={toggleSidebar} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar a la izquierda para navegación */}
        <Sidebar collapsed={isCollapsed} />

        {/* Main content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
                <p className="text-sm text-gray-500">Resumen rápido de tu área de trabajo</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-3 py-2 rounded-md bg-white border text-sm text-gray-700 hover:bg-gray-50">Filtros</button>
                <button className="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700">Nuevo proyecto</button>
              </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Proyectos</div>
                <div className="text-2xl font-bold text-gray-800">—</div>
                <div className="text-xs text-gray-400">Actualizado hace 5m</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Documentos</div>
                <div className="text-2xl font-bold text-gray-800">—</div>
                <div className="text-xs text-gray-400">Análisis en progreso: —</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Alertas</div>
                <div className="text-2xl font-bold text-red-600">—</div>
                <div className="text-xs text-gray-400">Revisa los últimos reportes</div>
              </div>
            </div>

            {/* Área de contenido principal */}
            <div className="bg-white rounded-lg shadow p-4 min-h-[400px]">
              <Outlet /> {/* Aquí se cargan las rutas hijas */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}