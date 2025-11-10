import { url as baseUrl } from "./api";

export interface OrganizationResponse {
    id: string;
    name: string;
    slug?: string;
    ownerUserId: number;
    createdAt: string;
    updatedAt: string;
    members?: OrganizationUser[];
}

export interface OrganizationUser {
    id: string;
    organizationId: string;
    userId: string;
    role: string;
    status: string;
    joinedAt: string;
    updatedAt: string;
}

// Listar organizaciones del usuario (requiere token)
export async function listarOrganizaciones(token: string): Promise<OrganizationResponse[]> {
    const res = await fetch(`${baseUrl}/api/organizations`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) throw new Error('Error al cargar organizaciones');
    return res.json();
}

// Crear organización
export async function crearOrganizacion(data: { name: string; slug: string; ownerUserId: number }, token: string): Promise<OrganizationResponse> {
    const res = await fetch(`${baseUrl}/api/organizations`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear organización');
    return res.json();
}
