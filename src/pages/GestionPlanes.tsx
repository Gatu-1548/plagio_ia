import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Loader2, CreditCard, ToggleLeft, ToggleRight, Eye } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { useAuth } from "@/context/AuthContext";
import {
    listarPlanes,
    obtenerPlanPorId,
    crearPlan,
    editarPlan,
    eliminarPlan,
    cambiarEstadoPlan,
    type Plan,
    type PlanCreate,
} from "@/Services/planServices";

export default function GestionPlanes() {
    const { token } = useAuth();
    const [planes, setPlanes] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [formData, setFormData] = useState<PlanCreate>({
        code: "",
        name: "",
        description: "",
        billingInterval: "MONTHLY",
        priceCents: 0,
        currency: "USD",
        limitMembers: 1,
        limitChecks: 100,
        active: true,
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (token) {
            fetchPlanes();
        }
    }, [token]);

    const fetchPlanes = async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const data = await listarPlanes(token);
            setPlanes(data);
        } catch (err: any) {
            console.error("Error al obtener planes:", err);
            setError(err.message || "Error al cargar planes");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingPlan(null);
        setFormData({
            code: "",
            name: "",
            description: "",
            billingInterval: "MONTHLY",
            priceCents: 0,
            currency: "USD",
            limitMembers: 1,
            limitChecks: 100,
            active: true,
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (plan: Plan) => {
        setEditingPlan(plan);
        setFormData({
            code: plan.code,
            name: plan.name,
            description: plan.description,
            billingInterval: plan.billingInterval,
            priceCents: plan.priceCents,
            currency: plan.currency,
            limitMembers: plan.limitMembers,
            limitChecks: plan.limitChecks,
            active: plan.active,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!token) return;
        if (!formData.code || !formData.name || !formData.description) {
            alert("Código, nombre y descripción son obligatorios");
            return;
        }

        setSubmitting(true);
        try {
            if (editingPlan) {
                // Editar plan (PATCH parcial)
                const updateData: Partial<Plan> = {
                    description: formData.description,
                    limitChecks: formData.limitChecks,
                    // Puedes agregar más campos según necesites
                };
                await editarPlan(editingPlan.id, updateData, token);
            } else {
                // Crear plan
                await crearPlan(formData, token);
            }
            setIsModalOpen(false);
            await fetchPlanes();
            setFormData({
                code: "",
                name: "",
                description: "",
                billingInterval: "MONTHLY",
                priceCents: 0,
                currency: "USD",
                limitMembers: 1,
                limitChecks: 100,
                active: true,
            });
        } catch (err: any) {
            console.error("Error al guardar plan:", err);
            alert(err.message || "Error al guardar plan");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (planId: string, planName: string) => {
        if (!token) return;
        if (!confirm(`¿Estás seguro de eliminar el plan "${planName}"? Esta acción no se puede deshacer.`)) return;

        try {
            await eliminarPlan(planId, token);
            await fetchPlanes();
        } catch (err: any) {
            console.error("Error al eliminar plan:", err);
            alert(err.message || "Error al eliminar plan");
        }
    };

    const handleToggleActive = async (plan: Plan) => {
        if (!token) return;
        try {
            await cambiarEstadoPlan(plan.id, !plan.active, token);
            await fetchPlanes();
        } catch (err: any) {
            console.error("Error al cambiar estado del plan:", err);
            alert(err.message || "Error al cambiar estado del plan");
        }
    };

    const handleViewDetails = async (planId: string) => {
        if (!token) return;
        try {
            const plan = await obtenerPlanPorId(planId, token);
            const price = (plan.priceCents / 100).toFixed(2);
            alert(
                `Plan: ${plan.name}\n` +
                `Código: ${plan.code}\n` +
                `Descripción: ${plan.description}\n` +
                `Precio: ${plan.currency} ${price} (${plan.billingInterval === "MONTHLY" ? "Mensual" : "Anual"})\n` +
                `Límite Miembros: ${plan.limitMembers || "Ilimitado"}\n` +
                `Límite Verificaciones: ${plan.limitChecks || "Ilimitado"}\n` +
                `Estado: ${plan.active ? "Activo" : "Inactivo"}`
            );
        } catch (err: any) {
            console.error("Error al obtener detalles:", err);
            alert(err.message || "Error al obtener detalles del plan");
        }
    };

    const filteredPlanes = planes.filter((plan) =>
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatPrice = (priceCents: number, currency: string) => {
        return `${currency} ${(priceCents / 100).toFixed(2)}`;
    };

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
                <span className="ml-3 text-gray-600">Cargando planes...</span>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Gestión de Planes</h2>
                    <p className="text-sm text-gray-600">Administra los planes de suscripción del sistema</p>
                </div>
                <Button onClick={handleOpenCreate} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Crear Plan
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
                        placeholder="Buscar por nombre, código o descripción..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Tabla de planes */}
            <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Código
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nombre
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Precio
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Intervalo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Límites
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPlanes.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        {searchTerm ? "No se encontraron planes" : "No hay planes registrados"}
                                    </td>
                                </tr>
                            ) : (
                                filteredPlanes.map((plan) => (
                                    <tr key={plan.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="w-5 h-5 text-indigo-600" />
                                                <span className="text-sm font-medium text-gray-900">{plan.code}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                                            <div className="text-xs text-gray-500 mt-1">{plan.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-gray-900">
                                                {formatPrice(plan.priceCents, plan.currency)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                                                {plan.billingInterval === "MONTHLY" ? "Mensual" : "Anual"}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs text-gray-600">
                                                <div>Miembros: {plan.limitMembers || "∞"}</div>
                                                <div>Verif.: {plan.limitChecks || "∞"}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge
                                                className={
                                                    plan.active
                                                        ? "bg-green-100 text-green-800 border-green-300"
                                                        : "bg-gray-100 text-gray-800 border-gray-300"
                                                }
                                            >
                                                {plan.active ? "Activo" : "Inactivo"}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(plan.id)}
                                                    className="flex items-center gap-1"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Ver
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleOpenEdit(plan)}
                                                    className="flex items-center gap-1"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Editar
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleToggleActive(plan)}
                                                    className={`flex items-center gap-1 ${
                                                        plan.active
                                                            ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                            : "text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    }`}
                                                    title={plan.active ? "Deshabilitar" : "Habilitar"}
                                                >
                                                    {plan.active ? (
                                                        <ToggleLeft className="w-4 h-4" />
                                                    ) : (
                                                        <ToggleRight className="w-4 h-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(plan.id, plan.name)}
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
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingPlan ? "Editar Plan" : "Crear Nuevo Plan"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingPlan
                                ? "Modifica la información del plan. Solo algunos campos son editables."
                                : "Completa los datos para crear un nuevo plan de suscripción."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="code">Código *</Label>
                                <Input
                                    id="code"
                                    type="text"
                                    placeholder="BASIC"
                                    value={formData.code}
                                    onChange={(e) =>
                                        setFormData({ ...formData, code: e.target.value.toUpperCase() })
                                    }
                                    disabled={!!editingPlan}
                                />
                            </div>
                            <div>
                                <Label htmlFor="name">Nombre *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Plan Básico"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    disabled={!!editingPlan}
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="description">Descripción *</Label>
                            <Input
                                id="description"
                                type="text"
                                placeholder="Incluye 1 asiento y 100 verificaciones"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="billingInterval">Intervalo de Facturación</Label>
                                <Select
                                    value={formData.billingInterval}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, billingInterval: value })
                                    }
                                    disabled={!!editingPlan}
                                >
                                    <SelectTrigger id="billingInterval">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MONTHLY">Mensual</SelectItem>
                                        <SelectItem value="YEARLY">Anual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="priceCents">Precio (centavos) *</Label>
                                <Input
                                    id="priceCents"
                                    type="number"
                                    placeholder="9900"
                                    value={formData.priceCents}
                                    onChange={(e) =>
                                        setFormData({ ...formData, priceCents: parseInt(e.target.value) || 0 })
                                    }
                                    disabled={!!editingPlan}
                                />
                            </div>
                            <div>
                                <Label htmlFor="currency">Moneda</Label>
                                <Select
                                    value={formData.currency}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, currency: value })
                                    }
                                    disabled={!!editingPlan}
                                >
                                    <SelectTrigger id="currency">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                        <SelectItem value="BOL">BOL</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="limitMembers">Límite de Miembros</Label>
                                <Input
                                    id="limitMembers"
                                    type="number"
                                    placeholder="1"
                                    value={formData.limitMembers || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, limitMembers: parseInt(e.target.value) || undefined })
                                    }
                                    disabled={!!editingPlan}
                                />
                            </div>
                            <div>
                                <Label htmlFor="limitChecks">Límite de Verificaciones *</Label>
                                <Input
                                    id="limitChecks"
                                    type="number"
                                    placeholder="100"
                                    value={formData.limitChecks || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, limitChecks: parseInt(e.target.value) || undefined })
                                    }
                                />
                            </div>
                        </div>
                        {!editingPlan && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="active"
                                    checked={formData.active ?? true}
                                    onChange={(e) =>
                                        setFormData({ ...formData, active: e.target.checked })
                                    }
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <Label htmlFor="active" className="cursor-pointer">
                                    Plan activo
                                </Label>
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
                            ) : editingPlan ? (
                                "Guardar Cambios"
                            ) : (
                                "Crear Plan"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

