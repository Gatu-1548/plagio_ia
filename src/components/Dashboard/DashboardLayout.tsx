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
              <Outlet /> {/* Aquí se cargan las rutas hijas */}
          </div>
        </main>
      </div>
    </div>
  );
}