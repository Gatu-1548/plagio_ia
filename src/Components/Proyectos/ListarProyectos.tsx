import { useQuery, useMutation } from "@apollo/client/react";
import {
  GET_PROYECTOS_POR_USUARIO,
  GET_PROYECTOS_POR_USUARIO_Y_ORGANIZACION,
  GET_PROYECTOS_POR_ORGANIZACION,
  CREAR_PROYECTO,
  ACTUALIZAR_PROYECTO,
  ELIMINAR_PROYECTO,
} from "../../Services/proyectosGraphQL";
import { motion, AnimatePresence } from "framer-motion";
import { FolderOpen, Loader2, AlertCircle, PlusCircle, Edit2, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useOrganization } from "@/context/OrganizationContext";
import { useNavigate } from "react-router-dom";

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

  const [crearProyecto] = useMutation<any, { nombre: string; usuario_id: number }>(
    CREAR_PROYECTO
  );
  const [actualizarProyecto] = useMutation<any, { id: string; nombre: string }>(
    ACTUALIZAR_PROYECTO
  );
  const [eliminarProyecto] = useMutation<any, { id: string }>(ELIMINAR_PROYECTO);

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [nombreProyecto, setNombreProyecto] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

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
        variables: { nombre: nombreProyecto, usuario_id: Number(effectiveUserId) },
      });
      setNombreProyecto("");
      setShowModal(false);
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

    console.log("Editando proyecto", { id: editId, nombre: nombreProyecto });

    try {
      const { data } = await actualizarProyecto({
        variables: { id: editId as string, nombre: nombreProyecto },
      });
      console.log("Proyecto actualizado:", data);
      setShowModal(false);
      setEditMode(false);
      setNombreProyecto("");
      setEditId(null);
      refetch();
    } catch (err: any) {
      console.error("Error al actualizar proyecto - message:", err?.message);
      if (err?.graphQLErrors) console.error("graphQLErrors:", err.graphQLErrors);
      if (err?.networkError) console.error("networkError:", err.networkError);
      console.error("Full error object:", err);
      alert("Error al actualizar proyecto: " + (err?.message || JSON.stringify(err)));
    }
  };

  // Eliminar proyecto
  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este proyecto?")) return;

    try {
      await eliminarProyecto({ variables: { id } });
      refetch();
    } catch (err: any) {
      console.error("Error al eliminar proyecto - message:", err?.message);
      if (err?.graphQLErrors) console.error("graphQLErrors:", err.graphQLErrors);
      if (err?.networkError) console.error("networkError:", err.networkError);
      console.error("Full error object:", err);
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-gray-800 flex items-center gap-2">
          <FolderOpen className="w-8 h-8 text-indigo-600" />
          Mis Proyectos
        </h1>
        <button
          onClick={() => {
            setShowModal(true);
            setEditMode(false);
            setNombreProyecto("");
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <PlusCircle className="w-5 h-5" />
          Nuevo Proyecto
        </button>
      </div>

      {/* Lista de proyectos */}
      {proyectos.length === 0 ? (
        <div className="text-center text-gray-500 mt-16">
          <p className="text-lg">No tienes proyectos registrados todavía.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proyectos.map((proyecto: Proyecto, index: number) => (
            <motion.div
              key={proyecto.proyecto_id}
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
                <button
                  onClick={() => navigate(`/organization/dashboard/proyectos/${proyecto.proyecto_id}/documentos`)}
                  className="flex items-center gap-1 text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md"
                >
                  Ver
                </button>
                <button
                  onClick={() => {
                    setEditMode(true);
                    setEditId(proyecto.proyecto_id);
                    setNombreProyecto(proyecto.nombre);
                    setShowModal(true);
                  }}
                  className="flex items-center gap-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md"
                >
                  <Edit2 className="w-4 h-4" /> Editar
                </button>
                <button
                  onClick={() => handleDelete(proyecto.proyecto_id)}
                  className="flex items-center gap-1 text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
                >
                  <Trash2 className="w-4 h-4" /> Eliminar
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Crear/Editar */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-amber-50 bg-opacity-40 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editMode ? "Editar Proyecto" : "Nuevo Proyecto"}
                </h2>
                <button onClick={() => setShowModal(false)}>
                  <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                </button>
              </div>

              <input
                type="text"
                value={nombreProyecto}
                onChange={(e) => setNombreProyecto(e.target.value)}
                placeholder="Nombre del proyecto"
                className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:ring-2 focus:ring-indigo-400 outline-none"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={editMode ? handleEdit : handleCreate}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  {editMode ? "Actualizar" : "Crear"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}