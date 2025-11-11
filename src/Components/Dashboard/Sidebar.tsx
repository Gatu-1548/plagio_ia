import { useNavigate } from "react-router-dom";
import { Folder, FileText, LayoutDashboard } from "lucide-react";
import { Button } from "../ui/button";

interface SidebarProps {
  collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const navigate = useNavigate();

  return (
    <aside
      className={`
        ${collapsed ? "w-20" : "w-64"}
        bg-gray-900 text-white h-screen p-4 transition-all duration-300 flex flex-col
      `}
    >
      <Button
        variant="ghost"
        size="sm"
        className={`
          justify-start w-full h-auto py-2 mb-4 text-sm
          ${collapsed ? "px-2" : ""}
          hover:bg-white rounded-2xl
        `}
        onClick={() => navigate("/organization/dashboard")}
      >
        <div className="flex items-center gap-3 w-ful hover:text-gray-800">
          <LayoutDashboard size={20} />
          {!collapsed && <span className="font-medium">Dashboard</span>}
        </div>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={`
          justify-start w-full h-auto py-2 mb-4 text-sm
          ${collapsed ? "px-2" : ""}
          hover:bg-white rounded-2xl
        `}
        onClick={() => navigate("/organization/dashboard/proyectos/listar")}
      >
        <div className="flex items-center gap-3 w-ful hover:text-gray-800">
          <Folder size={20} />
          {!collapsed && <span className="font-medium">Listar proyectos</span>}
        </div>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={`
          justify-start w-full h-auto py-2 mb-4 text-sm
          ${collapsed ? "px-2" : ""}
          hover:bg-white rounded-2xl
        `}
        onClick={() => navigate("/organization/dashboard/manage/usuarios")}
      >
        <div className="flex items-center gap-3 w-ful hover:text-gray-800">
          <FileText size={20} />
          {!collapsed && <span className="font-medium">Gestionar Usuarios</span>}
        </div>
      </Button>
    </aside>
  );
}