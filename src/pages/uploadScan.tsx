import { useParams, useNavigate } from "react-router-dom";
import { useLazyQuery } from "@apollo/client/react";
import { GET_DOCUMENTO } from "../Services/proyectosGraphQL";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Upload, Loader2, CheckCircle, Clock, AlertCircle, FileIcon } from "lucide-react";
import { uploadDocumento } from "@/Services/uploadService";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

interface Documento {
  documento_id: string;
  nombre_archivo: string;
  estado: string;
  score_plagio: number | null;
  page_count: number | null;
  word_count: number | null;
  analysis_duration_ms: number | null;
}

interface GetDocumentoData {
  getDocumento: Documento | null;
}

interface GetDocumentoVars {
  id: string;
}

export default function UploadScanPage() {
  const { id: proyectoId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentoId, setDocumentoId] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentDoc, setCurrentDoc] = useState<Documento | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [getDocumento, { data: docData }] = useLazyQuery<GetDocumentoData, GetDocumentoVars>(GET_DOCUMENTO, { fetchPolicy: "network-only" });

  const intervalRef = useRef<number | null>(null);

  // Polling para análisis
  useEffect(() => {
    if (!documentoId || !analyzing) return;

    const startPolling = () => {
      getDocumento({ variables: { id: documentoId } });
      intervalRef.current = window.setInterval(() => {
        getDocumento({ variables: { id: documentoId } });
      }, 3000); // Poll cada 3 segundos
    };

    startPolling();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [documentoId, analyzing, getDocumento]);

  // Actualizar estado del documento
  useEffect(() => {
    if (docData?.getDocumento) {
      setCurrentDoc(docData.getDocumento);
      if (docData.getDocumento.estado === "COMPLETADO") {
        setAnalyzing(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }
  }, [docData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      setError("Por favor selecciona un archivo PDF.");
      return;
    }
    setError(null);
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file || !proyectoId) return;
    setUploading(true);
    setUploadProgress(0);
    setError(null);
    try {
      const resp = await uploadDocumento(proyectoId, file, (p) => setUploadProgress(p));
      console.log("Upload response:", resp);
      setDocumentoId(resp.documento_id); // Asumiendo que la respuesta incluye documento_id
      setAnalyzing(true);
      setFile(null);
    } catch (err: any) {
      console.error("Error subiendo documento:", err);
      setError("Error subiendo documento: " + (err?.message || String(err)));
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = () => {
    switch (currentDoc?.estado) {
      case "SUBIENDO": return <Upload className="w-5 h-5" />;
      case "ANALIZANDO": return <Loader2 className="w-5 h-5 animate-spin" />;
      case "COMPLETADO": return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusColor = () => {
    switch (currentDoc?.estado) {
      case "COMPLETADO": return "default";
      case "ERROR": return "destructive";
      default: return "secondary";
    }
  };

  if (!proyectoId) {
    return (
      <div className="p-6 bg-gray-50 h-full flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-500 mr-2" />
        <p>ID de proyecto no válido.</p>
      </div>
    );
  }

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
            Volver a Documentos
          </Button>
          <div className="flex items-center gap-2">
            <Upload className="w-6 h-6 text-green-600" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Subir y Escanear Documento</h1>
              <p className="text-sm text-gray-500">Proyecto ID: {proyectoId}</p>
            </div>
          </div>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Proceso de Subida y Análisis</CardTitle>
          <CardDescription>
            Selecciona un PDF, súbelo y observa el progreso del escaneo en tiempo real.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sección de Upload */}
          {(!uploading && !analyzing && !documentoId) || error ? (
            <div className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 text-red-600 p-3 bg-red-50 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Arrastra o selecciona un PDF</h3>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Button asChild variant="outline" className="px-6">
                    <span>Seleccionar archivo</span>
                  </Button>
                </label>
                {file && (
                  <p className="mt-2 text-sm text-gray-500">Seleccionado: {file.name}</p>
                )}
              </div>
              <Separator />
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Iniciar Subida
                  </>
                )}
              </Button>
            </div>
          ) : null}

          {/* Progreso de Upload */}
          {uploading && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <h3 className="text-lg font-medium">Subiendo archivo...</h3>
              </div>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-gray-500">Progreso: {uploadProgress}%</p>
            </div>
          )}

          {/* Progreso de Análisis */}
          {analyzing && currentDoc && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <h3 className="text-lg font-medium">
                    Analizando: {currentDoc.nombre_archivo}
                  </h3>
                </div>
                <Badge variant={getStatusColor()} className="w-fit">
                  Estado: {currentDoc.estado}
                </Badge>
                <Progress 
                  value={
                    currentDoc.estado === "COMPLETADO" ? 100 : 
                    currentDoc.estado === "ANALIZANDO" ? 50 : 25
                  } 
                  className="w-full" 
                />
                <p className="text-sm text-gray-500">
                  Actualizando en tiempo real... El análisis puede tomar unos minutos.
                </p>
              </div>
            </>
          )}

          {/* Resultados Finales */}
          {currentDoc?.estado === "COMPLETADO" && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <h3 className="text-lg font-medium text-green-600">¡Análisis completado!</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Score de Plagio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{currentDoc.score_plagio ?? 0}%</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Páginas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{currentDoc.page_count ?? 0}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Palabras</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{currentDoc.word_count ?? 0}</p>
                    </CardContent>
                  </Card>
                </div>
                {currentDoc.analysis_duration_ms && (
                  <p className="text-sm text-gray-500">
                    Tiempo de análisis: {currentDoc.analysis_duration_ms} ms
                  </p>
                )}
                <Button onClick={() => navigate(-1)} className="w-full">
                  Ver en Lista de Documentos
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}