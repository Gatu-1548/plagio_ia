import { useState } from "react";
import { Folder, FileText, ChevronRight, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const navigate = useNavigate();

  // Estados para desplegar las "carpetas"
  const [openProyectos, setOpenProyectos] = useState(false);
  const [openDocumentos, setOpenDocumentos] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-64"
      } bg-gray-900 text-white h-screen p-4 transition-all duration-300`}
    >
      

      {/* Sección: Proyectos */}
      <div>
        <button
          onClick={() => setOpenProyectos(!openProyectos)}
          className="flex items-center justify-between w-full px-2 py-2 rounded hover:bg-gray-800"
        >
          <div className="flex items-center gap-3">
            <Folder size={20} />
            {!collapsed && <span>Proyectos</span>}
          </div>
          {!collapsed &&
            (openProyectos ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
        </button>

        {/* Subopciones */}
        {!collapsed && openProyectos && (
          <div className="ml-8 mt-1 space-y-1">
            <button
              onClick={() => navigate("/dashboard/proyectos/listar")}
              className="block w-full text-left px-2 py-1 rounded hover:bg-gray-800 text-sm"
            >
              Listar proyectos
            </button>
            <button
              onClick={() => navigate("/dashboard/proyectos/crear")}
              className="block w-full text-left px-2 py-1 rounded hover:bg-gray-800 text-sm"
            >
              Crear proyecto
            </button>
          </div>
        )}
      </div>

      {/* Sección: Documentos */}
      <div className="mt-4">
        <button
          onClick={() => setOpenDocumentos(!openDocumentos)}
          className="flex items-center justify-between w-full px-2 py-2 rounded hover:bg-gray-800"
        >
          <div className="flex items-center gap-3">
            <FileText size={20} />
            {!collapsed && <span>Documentos</span>}
          </div>
          {!collapsed &&
            (openDocumentos ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
        </button>

        {/* Subopciones */}
        {!collapsed && openDocumentos && (
          <div className="ml-8 mt-1 space-y-1">
            <button
              onClick={() => navigate("/dashboard/documentos/listar")}
              className="block w-full text-left px-2 py-1 rounded hover:bg-gray-800 text-sm"
            >
              Listar documentos
            </button>
            <button
              onClick={() => navigate("/dashboard/documentos/subir")}
              className="block w-full text-left px-2 py-1 rounded hover:bg-gray-800 text-sm"
            >
              Subir documento
            </button>
          </div>
          
        )}
      </div>
    </aside>
  );
}