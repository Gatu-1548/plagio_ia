import { useEffect, useRef, useState } from "react";
import { useQuery, useLazyQuery, useMutation } from "@apollo/client/react";
import { GET_PROYECTO, GET_DOCUMENTO, ELIMINAR_DOCUMENTO } from "../../Services/proyectosGraphQL";
import { Loader2, Trash2 } from "lucide-react";

interface Documento {
  documento_id: string;
  nombre_archivo: string;
  estado: string;
  score_plagio: number | null;
  page_count: number | null;
  word_count: number | null;
  analysis_duration_ms: number | null;
}

interface ProyectoData {
  getProyecto: {
    proyecto_id: string;
    nombre: string;
    documentos: Documento[];
  } | null;
}

interface ProyectoVars {
  id: string;
}

export default function ProyectoDetalles({ proyectoId, onClose, onRefetch }: { proyectoId: string; onClose: () => void; onRefetch?: () => void; }) {
  const { loading, error, data, refetch } = useQuery<ProyectoData, ProyectoVars>(GET_PROYECTO, {
    variables: { id: proyectoId },
    fetchPolicy: "network-only",
  });

  const [getDocumento, { data: docData }] = useLazyQuery<{ getDocumento: Documento }, { id: string }>(GET_DOCUMENTO, { fetchPolicy: "network-only" });
  const [eliminarDocumento] = useMutation(ELIMINAR_DOCUMENTO);

  const [pollingDocId, setPollingDocId] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // cuando un documento cambia por polling, refrescar el proyecto
    if (docData && docData.getDocumento) {
      // si se completó, refetch proyecto
      if (docData.getDocumento.estado === "COMPLETADO") {
        refetch();
        setPollingDocId(null);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }
  }, [docData, refetch]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startPollingDocumento = (documentoId: string) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setPollingDocId(documentoId);
    // pedir inmediatamente
    getDocumento({ variables: { id: documentoId } });
    // luego poll cada 3s hasta que status sea COMPLETADO (o 60s)
    let elapsed = 0;
    intervalRef.current = window.setInterval(() => {
      elapsed += 3000;
      getDocumento({ variables: { id: documentoId } });
      if (elapsed >= 60000) {
        // timeout
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setPollingDocId(null);
      }
    }, 3000);
  };

  const handleEliminarDocumento = async (documentoId: string) => {
    if (!confirm("¿Eliminar documento? Esta acción no se puede deshacer.")) return;
    try {
      await eliminarDocumento({ variables: { id: documentoId } });
      await refetch();
      if (onRefetch) onRefetch();
    } catch (err: any) {
      console.error("Error eliminando documento", err);
      alert("Error eliminando documento: " + (err?.message || JSON.stringify(err)));
    }
  };

  if (loading)
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="animate-spin w-5 h-5" /> Cargando proyecto...
        </div>
      </div>
    );

  if (error)
    return (
      <div className="p-4 text-red-600">Error cargando proyecto: {error.message}</div>
    );

  const proyecto = data?.getProyecto;

  if (!proyecto) return <div className="p-4">Proyecto no encontrado.</div>;

  return (
    <div className="p-4 max-h-[70vh] overflow-auto">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{proyecto.nombre}</h3>
          <p className="text-sm text-gray-500">ID: {proyecto.proyecto_id}</p>
        </div>
        <div>
          <button onClick={onClose} className="px-3 py-1 rounded border">Cerrar</button>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Documentos ({proyecto.documentos.length})</h4>
        <div className="space-y-3">
          {proyecto.documentos.map((doc) => (
            <div key={doc.documento_id} className="border rounded p-3 bg-white flex items-start justify-between">
              <div>
                <div className="font-medium">{doc.nombre_archivo}</div>
                <div className="text-sm text-gray-500">ID: {doc.documento_id} — Estado: {doc.estado}</div>
                <div className="text-sm text-gray-600 mt-1">
                  Score: {doc.score_plagio ?? "-"} • Páginas: {doc.page_count ?? "-"} • Palabras: {doc.word_count ?? "-"}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => startPollingDocumento(doc.documento_id)}
                    className="px-3 py-1 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                    disabled={pollingDocId === doc.documento_id}
                  >
                    {pollingDocId === doc.documento_id ? "Polling..." : "Comprobar estado"}
                  </button>
                  <button
                    onClick={() => handleEliminarDocumento(doc.documento_id)}
                    className="px-3 py-1 rounded bg-red-600 text-white text-sm hover:bg-red-700 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Eliminar
                  </button>
                </div>
                {doc.analysis_duration_ms != null && (
                  <div className="text-xs text-gray-500">Duración: {doc.analysis_duration_ms} ms</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
