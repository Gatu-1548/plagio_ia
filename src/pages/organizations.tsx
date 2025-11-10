import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Users, Building2, Calendar } from 'lucide-react'; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';

interface Plan {
    id: string;
    name: string;
    description: string;
    billing_interval: string;
    code: string;
    price_cents: number;
    currency: string;
    active: boolean;
    created_at: Date;
    updated_at: Date;
}

interface Subscription {
    id: string;
    plan_id: string;
    organization_id: string;
    start_date: Date;
    end_date: Date;
    seat_count: number;
    model_uses_count: number;
    model_uses_limit: number;
    status: string;
    created_at: Date;
    updated_at: Date;
}

interface Organizations {
    id: string;
    name: string;
    owner_user_id: number;
    created_at: Date;
    updated_at: Date;
}

interface OrganizationUser {
    id: string;
    organization_id: string;
    user_id: string;
    role: string; 
    status: string; 
    joined_at: Date;
    updated_at: Date;
}

interface DisplayOrganization extends Organizations {
    role?: string; 
    status?: string; 
    subscription?: Subscription; 
}

const mockOwnedOrgs: DisplayOrganization[] = [
    {
        id: '1',
        name: 'Mi Equipo de Investigación',
        owner_user_id: 1,
        created_at: new Date('2025-10-15'),
        role: 'owner',
        status: 'active',
        updated_at: new Date(),
    },
    {
        id: '2',
        name: 'Proyecto Académico 2025',
        owner_user_id: 1,
        created_at: new Date('2025-11-01'),
        role: 'owner',
        status: 'active',
        updated_at: new Date(),
    },
];

const mockMemberOrgs: DisplayOrganization[] = [
    {
        id: '3',
        name: 'Colaboración Interuniversitaria',
        owner_user_id: 2,
        created_at: new Date('2025-09-20'),
        role: 'admin',
        status: 'active',
        updated_at: new Date(),
    },
    {
        id: '4',
        name: 'Grupo de Análisis de Textos',
        owner_user_id: 3,
        created_at: new Date('2025-08-10'),
        role: 'member',
        status: 'pending',
        updated_at: new Date(),
    },
];

export default function Organizations() {
    const navigate = useNavigate();
    const [ownedOrgs] = useState<DisplayOrganization[]>(mockOwnedOrgs); 
    const [memberOrgs] = useState<DisplayOrganization[]>(mockMemberOrgs); 

    const handleEnterOrg = (orgId: string) => {
        navigate(`/organizations/${orgId}/dashboard`); 
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const getRoleBadge = (role: string) => {
        const color = role === 'owner' ? 'bg-green-100 text-green-800' : role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
        return <Badge className={`${color} border capitalize`}>{role}</Badge>;
    };

    const getStatusBadge = (status: string) => {
        const color = status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
        return <Badge variant="secondary" className={`${color} border capitalize`}>{status}</Badge>;
    };

    const EmptyState = ({
        title,
        description,
        icon: Icon,
    }: {
        title: string;
        description: string;
        icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    }) => (
        <Card className="w-full border-dashed border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Icon className="h-12 w-12 text-gray-400 mb-4" />
                <CardTitle className="text-lg font-medium text-gray-900 mb-1">{title}</CardTitle>
                <CardDescription className="text-sm text-gray-500">{description}</CardDescription>
            </CardContent>
        </Card>
    );

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Mis Organizaciones</h1>
                <p className="text-muted-foreground">Gestiona tus equipos y proyectos para la detección de plagio.</p>
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
                                            {getRoleBadge(org.role || 'owner')}
                                            {getStatusBadge(org.status || 'active')}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span>Creada el {formatDate(org.created_at)}</span>
                                        </div>
                                        {org.subscription && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Users className="h-4 w-4" />
                                                <span>Miembros: {org.subscription.seat_count}</span>
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
                                            {getRoleBadge(org.role || 'member')}
                                            {getStatusBadge(org.status || 'pending')}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span>Unido el {formatDate(org.created_at)}</span>
                                        </div>
                                        {org.subscription && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Users className="h-4 w-4" />
                                                <span>Miembros: {org.subscription.seat_count}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardContent className="pt-0">
                                        <Button
                                            onClick={() => handleEnterOrg(org.id)}
                                            className="w-full"
                                            variant="outline"
                                            disabled={org.status !== 'active'}
                                        >
                                            {org.status === 'active' ? 'Entrar a la Organización' : 'Pendiente de Aprobación'}
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
                        />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}