import { useState } from "react";
import { Search, Loader2, FileText, Trash2, Eye, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_ALL_DOCS, ELIMINAR_DOCUMENTO } from "@/Services/proyectosGraphQL";

interface Documento {
    documento_id: string;
    nombre_archivo: string;
    estado: string;
    score_plagio: number | null;
    page_count: number | null;
    word_count: number | null;
    analysis_duration_ms: number | null;
}

export default function GestionDocumentos() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDocumento, setSelectedDocumento] = useState<Documento | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const { data, loading, error, refetch } = useQuery<{ getAllDocumentos: Documento[] }>(GET_ALL_DOCS, {
        fetchPolicy: "network-only",
    });

    const [eliminarDocumento] = useMutation(ELIMINAR_DOCUMENTO);

    const documentos = data?.getAllDocumentos || [];

    const handleDelete = async (documentoId: string, nombreArchivo: string) => {
        if (!confirm(`¿Estás seguro de eliminar el documento "${nombreArchivo}"? Esta acción no se puede deshacer.`)) return;

        try {
            await eliminarDocumento({
                variables: { id: documentoId },
            });
            await refetch();
        } catch (err: any) {
            console.error("Error al eliminar documento:", err);
            alert(err.message || "Error al eliminar documento");
        }
    };

    const handleViewDetails = (documento: Documento) => {
        setSelectedDocumento(documento);
        setIsDetailsModalOpen(true);
    };

    const filteredDocumentos = documentos.filter((doc) =>
        doc.nombre_archivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.documento_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.estado.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getEstadoBadge = (estado: string) => {
        switch (estado) {
            case "COMPLETADO":
                return (
                    <Badge className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" />
                        Completado
                    </Badge>
                );
            case "PROCESANDO":
            case "EN_PROCESO":
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 flex items-center gap-1 w-fit">
                        <Clock className="w-3 h-3" />
                        Procesando
                    </Badge>
                );
            case "ERROR":
            case "FALLIDO":
                return (
                    <Badge className="bg-red-100 text-red-800 border-red-300 flex items-center gap-1 w-fit">
                        <XCircle className="w-3 h-3" />
                        Error
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-gray-100 text-gray-800 border-gray-300 flex items-center gap-1 w-fit">
                        {estado}
                    </Badge>
                );
        }
    };

    const formatDuration = (ms: number | null) => {
        if (!ms) return "—";
        if (ms < 1000) return `${ms} ms`;
        return `${(ms / 1000).toFixed(2)} s`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <span className="ml-3 text-gray-600">Cargando documentos...</span>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Gestión de Documentos</h2>
                    <p className="text-sm text-gray-600">Administra y monitorea todos los documentos del sistema</p>
                </div>
                <div className="text-sm text-gray-500">
                    Total: {documentos.length} documentos
                </div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error.message || "Error al cargar documentos"}</p>
                </div>
            )}

            {/* Barra de búsqueda */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Buscar por nombre, ID o estado..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Tabla de documentos */}
            <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nombre Archivo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Score Plagio
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estadísticas
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Duración
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredDocumentos.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        {searchTerm ? "No se encontraron documentos" : "No hay documentos registrados"}
                                    </td>
                                </tr>
                            ) : (
                                filteredDocumentos.map((doc) => (
                                    <tr key={doc.documento_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-5 h-5 text-indigo-600" />
                                                <span className="text-sm font-medium text-gray-900">{doc.documento_id}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{doc.nombre_archivo}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getEstadoBadge(doc.estado)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-gray-900">
                                                {doc.score_plagio !== null ? `${doc.score_plagio}%` : "—"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs text-gray-600">
                                                <div>Páginas: {doc.page_count ?? "—"}</div>
                                                <div>Palabras: {doc.word_count ? doc.word_count.toLocaleString() : "—"}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600">
                                                {formatDuration(doc.analysis_duration_ms)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(doc)}
                                                    className="flex items-center gap-1"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Ver
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(doc.documento_id, doc.nombre_archivo)}
                                                    className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Eliminar
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de detalles */}
            <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Detalles del Documento</DialogTitle>
                        <DialogDescription>
                            Información completa del documento seleccionado
                        </DialogDescription>
                    </DialogHeader>
                    {selectedDocumento && (
                        <div className="space-y-4 py-4">
                            <div>
                                <Label className="text-xs text-gray-500">ID del Documento</Label>
                                <p className="text-sm font-medium text-gray-900">{selectedDocumento.documento_id}</p>
                            </div>
                            <div>
                                <Label className="text-xs text-gray-500">Nombre del Archivo</Label>
                                <p className="text-sm font-medium text-gray-900">{selectedDocumento.nombre_archivo}</p>
                            </div>
                            <div>
                                <Label className="text-xs text-gray-500">Estado</Label>
                                <div className="mt-1">{getEstadoBadge(selectedDocumento.estado)}</div>
                            </div>
                            <div>
                                <Label className="text-xs text-gray-500">Score de Plagio</Label>
                                <p className="text-sm font-medium text-gray-900">
                                    {selectedDocumento.score_plagio !== null ? `${selectedDocumento.score_plagio}%` : "No disponible"}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs text-gray-500">Páginas</Label>
                                    <p className="text-sm font-medium text-gray-900">{selectedDocumento.page_count ?? "—"}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Palabras</Label>
                                    <p className="text-sm font-medium text-gray-900">
                                        {selectedDocumento.word_count ? selectedDocumento.word_count.toLocaleString() : "—"}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <Label className="text-xs text-gray-500">Duración del Análisis</Label>
                                <p className="text-sm font-medium text-gray-900">
                                    {formatDuration(selectedDocumento.analysis_duration_ms)}
                                </p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

