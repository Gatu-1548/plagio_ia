import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Loader2, Building2, Users, Eye } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import { useAuth } from "@/context/AuthContext";
import {
    listarOrganizaciones,
    obtenerOrganizacionPorId,
    crearOrganizacion,
    editarOrganizacion,
    eliminarOrganizacion,
    type OrganizationResponse,
    type CreateOrganizationRequest,
    type UpdateOrganizationRequest,
} from "@/Services/organizationServices";

export default function GestionOrganizaciones() {
    const { token, userId } = useAuth();
    const [organizaciones, setOrganizaciones] = useState<OrganizationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrg, setEditingOrg] = useState<OrganizationResponse | null>(null);
    const [formData, setFormData] = useState<CreateOrganizationRequest>({
        name: "",
        slug: "",
        ownerUserId: userId || 0,
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (token) {
            fetchOrganizaciones();
        }
    }, [token]);

    const fetchOrganizaciones = async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const data = await listarOrganizaciones(token);
            setOrganizaciones(data);
        } catch (err: any) {
            console.error("Error al obtener organizaciones:", err);
            setError(err.message || "Error al cargar organizaciones");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingOrg(null);
        setFormData({
            name: "",
            slug: "",
            ownerUserId: userId || 0,
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (org: OrganizationResponse) => {
        setEditingOrg(org);
        setFormData({
            name: org.name,
            slug: org.slug || "",
            ownerUserId: org.ownerUserId,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!token) return;
        if (!formData.name.trim()) {
            alert("El nombre de la organización es obligatorio");
            return;
        }

        setSubmitting(true);
        try {
            if (editingOrg) {
                // Editar organización (solo name y slug)
                const updateData: UpdateOrganizationRequest = {
                    name: formData.name,
                    slug: formData.slug || undefined,
                };
                await editarOrganizacion(editingOrg.id, updateData, token);
            } else {
                // Crear organización
                await crearOrganizacion(formData, token);
            }
            setIsModalOpen(false);
            await fetchOrganizaciones();
            setFormData({
                name: "",
                slug: "",
                ownerUserId: userId || 0,
            });
        } catch (err: any) {
            console.error("Error al guardar organización:", err);
            alert(err.message || "Error al guardar organización");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (orgId: string, orgName: string) => {
        if (!token) return;
        if (!confirm(`¿Estás seguro de eliminar la organización "${orgName}"? Esta acción no se puede deshacer.`)) return;

        try {
            await eliminarOrganizacion(orgId, token);
            await fetchOrganizaciones();
        } catch (err: any) {
            console.error("Error al eliminar organización:", err);
            alert(err.message || "Error al eliminar organización");
        }
    };

    const handleViewDetails = async (orgId: string) => {
        if (!token) return;
        try {
            const org = await obtenerOrganizacionPorId(orgId, token);
            alert(`Organización: ${org.name}\nID: ${org.id}\nPropietario ID: ${org.ownerUserId}\nMiembros: ${org.members?.length || 0}`);
        } catch (err: any) {
            console.error("Error al obtener detalles:", err);
            alert(err.message || "Error al obtener detalles de la organización");
        }
    };

    const filteredOrganizaciones = organizaciones.filter((org) =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <span className="ml-3 text-gray-600">Cargando organizaciones...</span>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Gestión de Organizaciones</h2>
                    <p className="text-sm text-gray-600">Administra todas las organizaciones del sistema</p>
                </div>
                <Button onClick={handleOpenCreate} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Crear Organización
                </Button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {/* Barra de búsqueda */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Buscar por nombre, slug o ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Tabla de organizaciones */}
            <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nombre
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Slug
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Propietario ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Miembros
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Creada
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrganizaciones.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        {searchTerm ? "No se encontraron organizaciones" : "No hay organizaciones registradas"}
                                    </td>
                                </tr>
                            ) : (
                                filteredOrganizaciones.map((org) => (
                                    <tr key={org.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-5 h-5 text-indigo-600" />
                                                <span className="text-sm font-medium text-gray-900">{org.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600">{org.slug || "—"}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">{org.ownerUserId}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1 w-fit">
                                                <Users className="w-3 h-3" />
                                                {org.members?.length || 0}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600">{formatDate(org.createdAt)}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(org.id)}
                                                    className="flex items-center gap-1"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Ver
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleOpenEdit(org)}
                                                    className="flex items-center gap-1"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Editar
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(org.id, org.name)}
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

            {/* Modal de crear/editar */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingOrg ? "Editar Organización" : "Crear Nueva Organización"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingOrg
                                ? "Modifica la información de la organización."
                                : "Completa los datos para crear una nueva organización en el sistema."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="name">Nombre *</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Mi Organización"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="slug">Slug (opcional)</Label>
                            <Input
                                id="slug"
                                type="text"
                                placeholder="mi-organizacion"
                                value={formData.slug}
                                onChange={(e) =>
                                    setFormData({ ...formData, slug: e.target.value })
                                }
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Si se deja vacío, se generará automáticamente desde el nombre
                            </p>
                        </div>
                        {!editingOrg && (
                            <div>
                                <Label htmlFor="ownerUserId">ID del Propietario *</Label>
                                <Input
                                    id="ownerUserId"
                                    type="number"
                                    value={formData.ownerUserId}
                                    onChange={(e) =>
                                        setFormData({ ...formData, ownerUserId: parseInt(e.target.value) || 0 })
                                    }
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                            disabled={submitting}
                        >
                            Cancelar
                        </Button>
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Guardando...
                                </>
                            ) : editingOrg ? (
                                "Guardar Cambios"
                            ) : (
                                "Crear Organización"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

