import { useQuery, useMutation } from "@apollo/client/react";
import {
  GET_PROYECTOS_POR_USUARIO,
  GET_PROYECTOS_POR_USUARIO_Y_ORGANIZACION,
  GET_PROYECTOS_POR_ORGANIZACION,
  CREAR_PROYECTO,
  ACTUALIZAR_PROYECTO,
  ELIMINAR_PROYECTO,
} from "../../Services/proyectosGraphQL";
import { motion } from "framer-motion";
import { FolderOpen, Loader2, AlertCircle, PlusCircle, Edit2, Trash2} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useOrganization } from "@/context/OrganizationContext";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogHeader, DialogFooter, DialogDescription, DialogTitle, DialogContent, DialogClose } from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

const userId = Number(sessionStorage.getItem("userId"));

interface Proyecto {
  proyecto_id: string;
  nombre: string;
  organizacion_id?: string;
}

interface GetProyectosPorUsuarioData {
  getProyectosPorUsuario: Proyecto[];
}

interface GetProyectosPorUsuarioVars {
  usuario_id: number;
}

export default function ListarProyectos() {
  const { userId: authUserId } = useAuth();
  const { currentOrg } = useOrganization();
  const navigate = useNavigate()

  // Preferir userId del contexto auth si existe
  const effectiveUserId = authUserId ?? userId;
  const organizacionId = currentOrg?.id ?? sessionStorage.getItem("organizationId");
  const isAdmin = sessionStorage.getItem("role") === "ROLE_ADMIN";

  // Elegir query según si es admin o no y si hay organizacion seleccionada
  const useQueryResult = (() => {
    if (isAdmin) {
      return useQuery(GET_PROYECTOS_POR_ORGANIZACION, {
        variables: { organizacion_id: organizacionId },
      }) as any;
    }

    if (organizacionId) {
      return useQuery(GET_PROYECTOS_POR_USUARIO_Y_ORGANIZACION, {
        variables: { usuario_id: Number(effectiveUserId), organizacion_id: organizacionId },
      }) as any;
    }

    // fallback al query por usuario simple
    return useQuery<GetProyectosPorUsuarioData, GetProyectosPorUsuarioVars>(GET_PROYECTOS_POR_USUARIO, {
      variables: { usuario_id: Number(effectiveUserId) },
    }) as any;
  })();

  const { loading, error, data, refetch } = useQueryResult;

  const [crearProyecto] = useMutation<any, { nombre: string; usuario_id: number, organizacion_id: string }>(
    CREAR_PROYECTO
  );
  const [actualizarProyecto] = useMutation<any, { id: string; nombre: string }>(
    ACTUALIZAR_PROYECTO
  );
  const [eliminarProyecto] = useMutation<any, { id: string }>(ELIMINAR_PROYECTO);

  const [isCreateEditModalOpen, setIsCreateEditModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [nombreProyecto, setNombreProyecto] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Proyecto | null>(null);

  // Normalizar resultados de las diferentes queries posibles
  const proyectos: Proyecto[] =
    (data && (data.getProyectosPorUsuario as Proyecto[])) ||
    (data && (data.getProyectosPorUsuarioYOrganizacion as Proyecto[])) ||
    (data && (data.getProyectosPorOrganizacion as Proyecto[])) ||
    [];

  // Crear proyecto
  const handleCreate = async () => {
    if (!nombreProyecto.trim()) return;
    try {
      await crearProyecto({
        variables: { nombre: nombreProyecto, usuario_id: Number(effectiveUserId), organizacion_id: organizacionId as string },
      });
      setNombreProyecto("");
      setIsCreateEditModalOpen(false); // Cierra el modal de shadcn
      refetch();
    } catch (err: any) {
      console.error("Error al crear proyecto:", err.message);
      alert("Error al crear proyecto: " + err.message);
    }
  };

  // Editar proyecto
  const handleEdit = async () => {
    if (!nombreProyecto.trim() || editId === null) {
      alert("El ID del proyecto no está definido o el nombre está vacío.");
      return;
    }
    try {
      await actualizarProyecto({
        variables: { id: editId as string, nombre: nombreProyecto },
      });
      setIsCreateEditModalOpen(false); 
      setEditMode(false);
      setNombreProyecto("");
      setEditId(null);
      refetch();
    } catch (err: any) {
      console.error("Error al actualizar proyecto:", err);
      alert("Error al actualizar proyecto: " + (err?.message || JSON.stringify(err)));
    }
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;

    try {
      await eliminarProyecto({ variables: { id: projectToDelete.proyecto_id } });
      refetch();
      setIsDeleteModalOpen(false); 
      setProjectToDelete(null);
    } catch (err: any) {
      console.error("Error al eliminar proyecto:", err);
      alert("Error al eliminar proyecto: " + (err?.message || JSON.stringify(err)));
    }
  };

if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Loader2 className="animate-spin w-10 h-10 mb-3" />
        <p className="text-lg font-medium">Cargando proyectos...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-64 text-red-600 gap-2">
        <AlertCircle className="w-6 h-6" />
        <p className="font-medium">Error: {error.message}</p>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-full">      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-gray-800 flex items-center gap-2">
          <FolderOpen className="w-8 h-8 text-indigo-600" />
          Mis Proyectos
        </h1>
        
        <Button
          onClick={() => {
            setEditMode(false);
            setNombreProyecto("");
            setEditId(null);
            setIsCreateEditModalOpen(true); 
          }}
          className="flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          Nuevo Proyecto
        </Button>
      </div>

      {proyectos.length === 0 ? (
        <div className="text-center text-gray-500 mt-16">
          <p className="text-lg">No tienes proyectos registrados todavía.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proyectos.map((proyecto: Proyecto, index: number) => (
            <motion.div
              key={proyecto.proyecto_id}
              // ... (animación)
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold text-indigo-700 mb-2 truncate">
                {proyecto.nombre}
              </h2>
              <p className="text-gray-500 text-sm mb-4">ID: {proyecto.proyecto_id}</p>

              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => navigate(`/organization/dashboard/proyectos/${proyecto.proyecto_id}/documentos`)}
                  variant="default"
                  size="sm"
                >
                  Ver
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditMode(true);
                    setEditId(proyecto.proyecto_id);
                    setNombreProyecto(proyecto.nombre);
                    setIsCreateEditModalOpen(true); 
                  }}
                  className="flex items-center gap-1"
                >
                  <Edit2 className="w-4 h-4" /> Editar
                </Button>
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setProjectToDelete(proyecto);
                    setIsDeleteModalOpen(true);
                  }}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" /> Eliminar
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* --- LOS MODALES AHORA VIVEN AQUÍ, FUERA DEL LAYOUT --- */}

      {/* --- MODAL DE CREAR/EDITAR (shadcn) --- */}
      <Dialog open={isCreateEditModalOpen} onOpenChange={setIsCreateEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Editar Proyecto" : "Nuevo Proyecto"}
            </DialogTitle>
            <DialogDescription>
              {editMode
                ? "Actualiza el nombre de tu proyecto."
                : "Dale un nombre a tu nuevo proyecto para empezar."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre" className="text-right">
                Nombre
              </Label>
              <Input
                id="nombre"
                value={nombreProyecto}
                onChange={(e) => setNombreProyecto(e.target.value)}
                placeholder="Ej. Tesis de Grado"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" onClick={editMode ? handleEdit : handleCreate}>
              {editMode ? "Guardar Cambios" : "Crear Proyecto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* --- FIN DEL MODAL CREAR/EDITAR --- */}


      {/* --- MODAL DE ELIMINACIÓN (NUEVO) --- */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              el proyecto <strong className="text-red-600">{projectToDelete?.nombre}</strong> y todos
              sus documentos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProjectToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* --- FIN DEL MODAL DE ELIMINACIÓN --- */}

    </div>
  );
}