import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, Calendar, Plus, CreditCard, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { listarPlanes, type Plan } from '@/Services/planServices';
import { listarOrganizaciones, crearOrganizacion, type OrganizationResponse } from '@/Services/organizationServices';
import { crearSuscripcion, type SubscriptionResponse } from '@/Services/subscriptionServices';
import { useAuth } from '@/context/AuthContext';
import { useOrganization } from '@/context/OrganizationContext';


// DisplayOrganization extendido para frontend (con parsed dates)
interface DisplayOrganization extends Omit<OrganizationResponse, 'createdAt' | 'updatedAt'> {
    createdAt: Date;
    updatedAt: Date;
    role?: string;
    status?: string;
    subscription?: SubscriptionResponse;
}

// Props para EmptyState
interface EmptyStateProps {
    title: string;
    description: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    onAction?: () => void;
    actionText?: string;
}

export default function Organizations() {
    const navigate = useNavigate();
    const { userId, token, role } = useAuth();
    const { setCurrentOrg } = useOrganization();
    const [ownedOrgs, setOwnedOrgs] = useState<DisplayOrganization[]>([]);
    const [memberOrgs, setMemberOrgs] = useState<DisplayOrganization[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estado para modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [orgName, setOrgName] = useState('');
    const [orgDescription, setOrgDescription] = useState('');

    useEffect(() => {
        if (!userId) return;
        fetchInit();
    }, [userId]);

    const fetchInit = async () => {
        setLoading(true);
        setError(null);
        try {
            const fetchedPlans = await listarPlanes(token || '');
            setPlans(fetchedPlans);

            const orgsData: OrganizationResponse[] = await listarOrganizaciones(token || '');
            console.log(orgsData);

            const owned: DisplayOrganization[] = orgsData
                .filter(org => org.ownerUserId === userId)
                .map(org => ({
                    ...org,
                    createdAt: new Date(org.createdAt),
                    updatedAt: new Date(org.updatedAt),
                    role: "OWNER",
                    status: "ACTIVE",
                }));

            const members: DisplayOrganization[] = orgsData
                .filter(org =>
                    org.ownerUserId !== userId &&
                    org.members?.some(member => member.userId === userId)
                )
                .map(org => {
                    const memberInfo = org.members?.find(m => m.userId === userId);
                    return {
                        ...org,
                        createdAt: new Date(org.createdAt),
                        updatedAt: new Date(org.updatedAt),
                        role: memberInfo?.role,
                        status: memberInfo?.status,
                    } as DisplayOrganization;
                });

            setOwnedOrgs(owned);
            setMemberOrgs(members);
        } catch (err) {
            console.error(err);
            setError('Error al cargar datos. Intenta recargar.');
        } finally {
            setLoading(false);
        }
    };



    const handleEnterOrg = (orgId: string) => {
        const org = [...ownedOrgs, ...memberOrgs].find(o => o.id === orgId);
        if (org) {
            setCurrentOrg({
                ...org,
                createdAt: org.createdAt instanceof Date ? org.createdAt.toISOString() : org.createdAt,
                updatedAt: org.updatedAt instanceof Date ? org.updatedAt.toISOString() : org.updatedAt,
            });
        }
        navigate('/organization/dashboard');
    };

    const handleOpenCreateModal = () => {
        setIsCreateModalOpen(true);
    };

    const handleCreateOrg = async () => {
        if (!selectedPlan || !orgName.trim() || !userId || !token) {
            alert('Por favor, selecciona un plan y un nombre. Verifica tu sesión.');
            return;
        }

        try {
            setLoading(true);

            // Paso 1: Crear organización
            const newOrg = await crearOrganizacion({
                name: orgName,
                slug: orgName.toLowerCase().replace(/\s+/g, '-'),
                ownerUserId: userId,
            }, token);

            // Paso 2: Crear suscripción para la nueva org
            const newSub = await crearSuscripcion(newOrg.id, {
                planId: selectedPlan.id,
                startDate: new Date().toISOString().split('T')[0],
                renewsAt: new Date(Date.now() + (selectedPlan.billingInterval === 'MONTHLY' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                seatCount: 1,
            }, token);

            // Actualiza UI local (en prod, refetch con fetchInit())
            const processedNewOrg: DisplayOrganization = {
                ...newOrg,
                createdAt: new Date(newOrg.createdAt),
                updatedAt: new Date(newOrg.updatedAt),
                role: 'OWNER',
                status: 'ACTIVE',
                subscription: newSub,
            };
            setOwnedOrgs(prev => [...prev, processedNewOrg]);

            // Setear como organización activa en el contexto
            setCurrentOrg({
                ...processedNewOrg,
                createdAt: processedNewOrg.createdAt instanceof Date ? processedNewOrg.createdAt.toISOString() : processedNewOrg.createdAt,
                updatedAt: processedNewOrg.updatedAt instanceof Date ? processedNewOrg.updatedAt.toISOString() : processedNewOrg.updatedAt,
            });

            // Limpia modal
            setIsCreateModalOpen(false);
            setOrgName('');
            setOrgDescription('');
            setSelectedPlan(null);

            navigate('/organization/dashboard');
        } catch (err) {
            console.error(err);
            alert(`Error: ${(err as Error).message}. Verifica tu conexión o permisos.`);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formatPrice = (priceCents: number, currency: string) => {
        const dollars = (priceCents / 100).toFixed(2);
        return `${currency} ${dollars}`;
    };

    const getRoleBadge = (role: string) => {
        const color = role === 'OWNER' ? 'bg-green-100 text-green-800' : role === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
        return <Badge className={`${color} border capitalize`}>{role.toLowerCase()}</Badge>;
    };

    const getStatusBadge = (status: string) => {
        const color = status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
        return <Badge variant="secondary" className={`${color} border capitalize`}>{status.toLowerCase()}</Badge>;
    };

    const EmptyState = ({ title, description, icon: Icon, onAction, actionText }: EmptyStateProps) => (
        <Card className="w-full border-dashed border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Icon className="h-12 w-12 text-gray-400 mb-4" />
                <CardTitle className="text-lg font-medium text-gray-900 mb-1">{title}</CardTitle>
                <CardDescription className="text-sm text-gray-500 mb-6">{description}</CardDescription>
                {onAction && (
                    <Button onClick={onAction} variant="outline" size="sm">
                        {actionText || 'Acción'}
                    </Button>
                )}
            </CardContent>
        </Card>
    );

    const LoadingSkeleton = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <div className="flex gap-2">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-16" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                    <CardContent className="pt-0">
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="mb-8">
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Tabs defaultValue="owned" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <Skeleton className="h-10 w-full" />
                    </TabsList>
                    <LoadingSkeleton />
                </Tabs>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="text-center py-12">
                    <CardTitle className="text-red-600 mb-2">{error}</CardTitle>
                    <Button onClick={fetchInit}>Reintentar</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                        {role === "ROLE_ADMIN" && (
                            <button
                                onClick={() => navigate("/erp")}
                                className="p-3 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 bg-indigo-50 border border-indigo-200"
                                title="Sistema de Gestión Empresarial"
                            >
                                <Shield size={28} className="text-indigo-600" />
                            </button>
                        )}
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mis Organizaciones</h1>
                    </div>
                    <p className={`text-muted-foreground ${role === "ROLE_ADMIN" ? "ml-[60px]" : ""}`}>Gestiona tus equipos y proyectos para la detección de plagio.</p>
                </div>
                <Button onClick={handleOpenCreateModal} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Crear Organización
                </Button>
            </div>

            <Tabs defaultValue="owned" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="owned">Mis Organizaciones (Creadas)</TabsTrigger>
                    <TabsTrigger value="member">Organizaciones a las que Pertenezco</TabsTrigger>
                </TabsList>

                {/* Sección 1: Organizaciones Creadas */}
                <TabsContent value="owned" className="mt-6">
                    {ownedOrgs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {ownedOrgs.map((org) => (
                                <Card key={org.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg font-semibold">{org.name}</CardTitle>
                                            <Building2 className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            {getRoleBadge(org.role || 'OWNER')}
                                            {getStatusBadge(org.status || 'ACTIVE')}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span>Creada el {formatDate(org.createdAt)}</span>
                                        </div>
                                        {org.subscription && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Users className="h-4 w-4" />
                                                <span>Miembros: {org.subscription.seatCount}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardContent className="pt-0">
                                        <Button
                                            onClick={() => handleEnterOrg(org.id)}
                                            className="w-full"
                                            variant="outline"
                                        >
                                            Entrar a la Organización
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title="No hay organizaciones creadas"
                            description="Crea tu primera organización para empezar a detectar plagio en documentos."
                            icon={Building2}
                            onAction={handleOpenCreateModal}
                            actionText="Crear Nueva Organización"
                        />
                    )}
                </TabsContent>

                {/* Sección 2: Organizaciones Miembro */}
                <TabsContent value="member" className="mt-6">
                    {memberOrgs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {memberOrgs.map((org) => (
                                <Card key={org.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg font-semibold">{org.name}</CardTitle>
                                            <Building2 className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            {getRoleBadge(org.role || 'MEMBER')}
                                            {getStatusBadge(org.status || 'PENDING')}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span>Unido el {formatDate(org.createdAt)}</span>
                                        </div>
                                        {org.subscription && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Users className="h-4 w-4" />
                                                <span>Miembros: {org.subscription.seatCount}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardContent className="pt-0">
                                        <Button
                                            onClick={() => handleEnterOrg(org.id)}
                                            className="w-full"
                                            variant="outline"
                                            disabled={org.status !== 'ACTIVE'}
                                        >
                                            {org.status === 'ACTIVE' ? 'Entrar a la Organización' : 'Pendiente de Aprobación'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title="No perteneces a ninguna organización"
                            description="Únete o crea una organización para colaborar en la detección de plagio."
                            icon={Users}
                            onAction={handleOpenCreateModal}
                            actionText="Crear Mi Primera Organización"
                        />
                    )}
                </TabsContent>
            </Tabs>

            {/* Modal de Creación */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Crear Nueva Organización</DialogTitle>
                        <DialogDescription>
                            Selecciona un plan y proporciona detalles para comenzar.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="plan">Plan de Suscripción</Label>
                            <Select value={selectedPlan?.id || ''} onValueChange={(value) => {
                                const plan = plans.find(p => p.id === value);
                                setSelectedPlan(plan || null);
                            }}>
                                <SelectTrigger id="plan">
                                    <SelectValue placeholder="Elige un plan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {plans.map((plan) => (
                                        <SelectItem key={plan.id} value={plan.id}>
                                            <div className="flex items-center justify-between">
                                                <span>{plan.name}</span>
                                                <span className="font-semibold">
                                                    {formatPrice(plan.priceCents, plan.currency)}
                                                    {plan.billingInterval === 'MONTHLY' ? ' / mes' : ' / año'}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="orgName">Nombre de la Organización</Label>
                            <Input
                                id="orgName"
                                placeholder="Ej. Mi Equipo de Detección de Plagio"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="orgDescription">Descripción (Opcional)</Label>
                            <Input
                                id="orgDescription"
                                placeholder="Breve descripción de tu equipo o proyecto"
                                value={orgDescription}
                                onChange={(e) => setOrgDescription(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCreateOrg}
                            disabled={!selectedPlan || !orgName.trim() || loading}
                            className="flex items-center gap-2"
                        >
                            {loading ? 'Creando...' : (
                                <>
                                    <CreditCard className="h-4 w-4" />
                                    Crear y Suscribir
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}