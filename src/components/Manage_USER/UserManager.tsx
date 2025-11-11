import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Loader2, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import {
    obtenerUsuarios,
    crearUsuario,
    editarUsuario,
    eliminarUsuarioPorEmail,
    type UserResponse,
    type CreateUserRequest,
} from "@/Services/userServices";

export default function GestionUsuarios() {
    const { token } = useAuth();
    const [usuarios, setUsuarios] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
    const [formData, setFormData] = useState<CreateUserRequest>({
        email: "",
        password: "",
        role: "USER",
        enabled: true,
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (token) {
            fetchUsuarios();
        }
    }, [token]);

    const fetchUsuarios = async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const data = await obtenerUsuarios(token);
            setUsuarios(data);
        } catch (err: any) {
            console.error("Error al obtener usuarios:", err);
            setError(err.message || "Error al cargar usuarios");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingUser(null);
        setFormData({
            email: "",
            password: "",
            role: "USER",
            enabled: true,
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (user: UserResponse) => {
        setEditingUser(user);
        setFormData({
            email: user.email,
            password: "", // No prellenamos la contraseña por seguridad
            role: user.role,
            enabled: user.enabled,
        });
        setIsModalOpen(true);
    };

   const handleSubmit = async () => {
  if (!token) return;

  if (!formData.email || !formData.password) {
    alert("Email y contraseña son obligatorios");
    return;
  }

  setSubmitting(true);

  try {
    if (editingUser) {
      // Editar usuario
      await editarUsuario(editingUser.id, formData, token);
    } else {
      // Crear usuario
      await crearUsuario(formData, token);
    }

    setIsModalOpen(false);
    await fetchUsuarios();
    setFormData({
      email: "",
      password: "",
      role: "USER",
      enabled: true,
    });
  } catch (err: any) {
    console.error("Error al guardar usuario:", err);
    alert(err.message || "Error al guardar usuario");
  } finally {
    setSubmitting(false);
  }
};

    const handleDelete = async (id: number) => {
        if (!token) return;
        if (!confirm(`¿Estás seguro de eliminar al usuario ${id}?`)) return;

        try {
            await eliminarUsuarioPorEmail(id, token);
            await fetchUsuarios();
        } catch (err: any) {
            console.error("Error al eliminar usuario:", err);
            alert(err.message || "Error al eliminar usuario");
        }
    };

    const filteredUsuarios = usuarios.filter((user) =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadge = (role: string) => {
        if (role === "ADMIN" || role === "ROLE_ADMIN") {
            return (
                <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                </Badge>
            );
        }
        return (
            <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                <User className="w-3 h-3 mr-1" />
                Usuario
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <span className="ml-3 text-gray-600">Cargando usuarios...</span>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Administración de Usuarios</h2>
                    <p className="text-sm text-gray-600">Gestiona usuarios, roles y permisos del sistema</p>
                </div>
                <Button onClick={handleOpenCreate} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Crear Usuario
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
                        placeholder="Buscar por email o rol..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Tabla de usuarios */}
            <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsuarios.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        {searchTerm ? "No se encontraron usuarios" : "No hay usuarios registrados"}
                                    </td>
                                </tr>
                            ) : (
                                filteredUsuarios.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge
                                                className={
                                                    user.enabled
                                                        ? "bg-green-100 text-green-800 border-green-300"
                                                        : "bg-red-100 text-red-800 border-red-300"
                                                }
                                            >
                                                {user.enabled ? "Activo" : "Inactivo"}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm" onClick={() => handleOpenEdit(user)} className="flex items-center gap-1">
                                                    <Edit className="w-4 h-4" /> Editar
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleDelete(user.id)} className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50">
                                                    <Trash2 className="w-4 h-4" /> Eliminar
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
                        <DialogTitle>{editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}</DialogTitle>
                        <DialogDescription>
                            {editingUser
                                ? "Modifica la información del usuario. Deja la contraseña vacía para mantener la actual."
                                : "Completa los datos para crear un nuevo usuario en el sistema."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="usuario@ejemplo.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Contraseña *{editingUser && " (dejar vacío para mantener la actual)"}</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="role">Rol</Label>
                            <Select
                                value={formData.role || "USER"}
                                onValueChange={(value) => setFormData({ ...formData, role: value })}
                            >
                                <SelectTrigger id="role">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USER">Usuario</SelectItem>
                                    <SelectItem value="ADMIN">Administrador</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="enabled"
                                checked={formData.enabled ?? true}
                                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <Label htmlFor="enabled" className="cursor-pointer">Usuario habilitado</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={submitting}>Cancelar</Button>
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</> : editingUser ? "Guardar Cambios" : "Crear Usuario"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}