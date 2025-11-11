import { useNavigate } from "react-router-dom";
import { Folder, FileText, LayoutDashboard } from "lucide-react";
import { Button } from "../ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

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
          hover:bg-gray-400/10 rounded
        `}
        onClick={() => navigate("/organization/dashboard")}
      >
        <div className="flex items-center gap-3 w-full">
          <LayoutDashboard size={20} />
          {!collapsed && <span className="font-medium">Dashboard</span>}
        </div>
      </Button>

      <Accordion type="multiple" className="w-full flex-1">
        {/* Sección: Proyectos */}
        <AccordionItem value="proyectos" className="border-none">
          <AccordionTrigger
            className={`
              px-2 py-2 rounded hover:bg-gray-800 data-[state=open]:bg-gray-800 border-none
              ${collapsed ? "[&>svg]:hidden" : ""}
            `}
          >
            <div className="flex items-center gap-3 w-full">
              <Folder size={20} />
              {!collapsed && <span className="text-sm font-medium">Proyectos</span>}
            </div>
          </AccordionTrigger>
          {!collapsed && (
            <AccordionContent className="px-2">
              <div className="space-y-1 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start w-full h-auto py-1 text-sm"
                  onClick={() => navigate("/organization/dashboard/proyectos/listar")}
                >
                  Listar proyectos
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start w-full h-auto py-1 text-sm"
                  onClick={() => navigate("/dashboard/proyectos/crear")}
                >
                  Crear proyecto
                </Button>
              </div>
            </AccordionContent>
          )}
        </AccordionItem>

        {/* Sección: Documentos */}
        <AccordionItem value="documentos" className="border-none mt-4">
          <AccordionTrigger
            className={`
              px-2 py-2 rounded hover:bg-gray-800 data-[state=open]:bg-gray-800 border-none
              ${collapsed ? "[&>svg]:hidden" : ""}
            `}
          >
            <div className="flex items-center gap-3 w-full">
              <FileText size={20} />
              {!collapsed && <span className="text-sm font-medium">Usuarios</span>}
            </div>
          </AccordionTrigger>
          {!collapsed && (
            <AccordionContent className="px-2">
              <div className="space-y-1 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start w-full h-auto py-1 text-sm"
                  onClick={() => navigate("/organization/dashboard/manage/usuarios")}
                >
                  Gestionar Usuarios
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start w-full h-auto py-1 text-sm"
                  onClick={() => navigate("/dashboard/documentos/subir")}
                >
                  Subir documento
                </Button>
              </div>
            </AccordionContent>
          )}
        </AccordionItem>
      </Accordion>
    </aside>
  );
}