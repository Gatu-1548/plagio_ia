import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useLazyQuery, useMutation } from "@apollo/client/react";
import { 
  GET_PROYECTO, 
  GET_DOCUMENTO, 
  ELIMINAR_DOCUMENTO 
} from "../Services/proyectosGraphQL";
import { FileText, Loader2, AlertCircle, ChevronLeft, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

export default function Documents(){
  const { id: proyectoId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { loading, error, data, refetch } = useQuery<ProyectoData, ProyectoVars>(GET_PROYECTO, {
    variables: { id: proyectoId || "" },
    skip: !proyectoId,
    fetchPolicy: "network-only",
  });

  const [getDocumento, { data: docData }] = useLazyQuery<{ getDocumento: Documento }, { id: string }>(GET_DOCUMENTO, { fetchPolicy: "network-only" });
  const [eliminarDocumento] = useMutation(ELIMINAR_DOCUMENTO);

  const [pollingDocId, setPollingDocId] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (docData && docData.getDocumento) {
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
    getDocumento({ variables: { id: documentoId } });
    let elapsed = 0;
    intervalRef.current = window.setInterval(() => {
      elapsed += 3000;
      getDocumento({ variables: { id: documentoId } });
      if (elapsed >= 60000) {
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
    } catch (err: any) {
      console.error("Error eliminando documento", err);
      alert("Error eliminando documento: " + (err?.message || JSON.stringify(err)));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Loader2 className="animate-spin w-10 h-10 mb-3" />
        <p className="text-lg font-medium">Cargando documentos...</p>
      </div>
    );
  }

  if (error || !proyectoId) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600 gap-2">
        <AlertCircle className="w-6 h-6" />
        <p className="font-medium">Error al cargar documentos</p>
      </div>
    );
  }

  const proyecto = data?.getProyecto;

  if (!proyecto) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p className="text-lg">Proyecto no encontrado.</p>
      </div>
    );
  }

  const documentos = proyecto.documentos || [];

  return (
    <div className="p-6 bg-gray-50 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver a Proyectos
          </Button>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                Documentos - {proyecto.nombre}
              </h1>
              <p className="text-sm text-gray-500">ID: {proyecto.proyecto_id}</p>
            </div>
          </div>
        </div>
        <Button
          onClick={() => navigate(`upload`)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
        >
          <Upload className="w-4 h-4" />
          Subir Documento
        </Button>
      </div>

      {/* Lista de documentos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Documentos ({documentos.length})</CardTitle>
              <CardDescription>Lista de documentos asociados al proyecto.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {documentos.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No hay documentos en este proyecto aún.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre del Archivo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Score de Plagio</TableHead>
                  <TableHead>Páginas</TableHead>
                  <TableHead>Palabras</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documentos.map((doc) => (
                  <TableRow key={doc.documento_id}>
                    <TableCell className="font-medium">
                      <div>{doc.nombre_archivo}</div>
                      <div className="text-sm text-gray-500">ID: {doc.documento_id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={doc.estado === "COMPLETADO" ? "default" : "secondary"}>
                        {doc.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>{doc.score_plagio ?? "-"}</TableCell>
                    <TableCell>{doc.page_count ?? "-"}</TableCell>
                    <TableCell>{doc.word_count ?? "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startPollingDocumento(doc.documento_id)}
                          disabled={pollingDocId === doc.documento_id}
                        >
                          {pollingDocId === doc.documento_id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Comprobando...
                            </>
                          ) : (
                            "Comprobar"
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleEliminarDocumento(doc.documento_id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {doc.analysis_duration_ms != null && (
                        <div className="text-xs text-gray-500 mt-1">
                          Duración: {doc.analysis_duration_ms} ms
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}