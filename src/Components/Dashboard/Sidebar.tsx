import { Folder, FileText, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const navigate = useNavigate();

  return (
    <aside
      className={`bg-indigo-700 text-white flex flex-col border-l border-indigo-600 transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-indigo-600">
        {!collapsed && <h1 className="font-bold text-lg">Panel</h1>}
      </div>

      <nav className="flex-1 p-2">
        <button
          onClick={() => navigate("/dashboard/proyectos")}
          className="flex items-center gap-3 w-full px-4 py-2 rounded hover:bg-indigo-600"
        >
          <Folder size={20} />
          {!collapsed && "Proyectos"}
        </button>

        <button
          onClick={() => navigate("/dashboard/documentos")}
          className="flex items-center gap-3 w-full px-4 py-2 rounded hover:bg-indigo-600"
        >
          <FileText size={20} />
          {!collapsed && "Documentos"}
        </button>
      </nav>

      <button
        onClick={() => {
          sessionStorage.clear();
          window.location.href = "/";
        }}
        className="flex items-center gap-3 justify-center bg-red-600 hover:bg-red-700 m-4 px-4 py-2 rounded"
      >
        <LogOut size={20} />
        {!collapsed && "Salir"}
      </button>
    </aside>
  );
}