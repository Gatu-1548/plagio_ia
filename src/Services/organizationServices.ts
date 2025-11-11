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
    id: number;
    userId: string | number;
    role: string;
    status: string;
    joinedAt: string;
    updatedAt: string;
}

export interface CreateOrganizationRequest {
    name: string;
    slug?: string;
    ownerUserId: number;
}

export interface UpdateOrganizationRequest {
    name?: string;
    slug?: string;
}

export interface AddMemberRequest {
    userId: number;
    role: string;
}

export interface PaginatedMembersResponse {
    content: OrganizationUser[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface MembersCountResponse {
    count: number;
}

/**
 * Listar todas las organizaciones
 * GET /api/organizations
 */
export async function listarOrganizaciones(token: string): Promise<OrganizationResponse[]> {
    const res = await fetch(`${baseUrl}/api/organizations`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error al cargar organizaciones: ${errorText || res.statusText}`);
    }
    return res.json();
}

/**
 * Obtener organización por ID
 * GET /api/organizations/{organizationId}
 */
export async function obtenerOrganizacionPorId(organizationId: string, token: string): Promise<OrganizationResponse> {
    const res = await fetch(`${baseUrl}/api/organizations/${organizationId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error al obtener organización: ${errorText || res.statusText}`);
    }
    return res.json();
}

/**
 * Crear organización
 * POST /api/organizations
 */
export async function crearOrganizacion(data: CreateOrganizationRequest, token: string): Promise<OrganizationResponse> {
    const res = await fetch(`${baseUrl}/api/organizations`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error al crear organización: ${errorText || res.statusText}`);
    }
    return res.json();
}

/**
 * Editar organización (PATCH parcial)
 * PATCH /api/organizations/{organizationId}
 */
export async function editarOrganizacion(
    organizationId: string,
    data: UpdateOrganizationRequest,
    token: string
): Promise<OrganizationResponse> {
    const res = await fetch(`${baseUrl}/api/organizations/${organizationId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error al editar organización: ${errorText || res.statusText}`);
    }
    return res.json();
}

/**
 * Eliminar organización
 * DELETE /api/organizations/{organizationId}
 */
export async function eliminarOrganizacion(organizationId: string, token: string): Promise<void> {
    const res = await fetch(`${baseUrl}/api/organizations/${organizationId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error al eliminar organización: ${errorText || res.statusText}`);
    }
}

/**
 * Listar miembros de una organización (paginable)
 * GET /api/organizations/{organizationId}/members?size=20&page=0&sort=userId,asc
 */
export async function listarMiembros(
    organizationId: string,
    token: string,
    options?: {
        size?: number;
        page?: number;
        sort?: string;
    }
): Promise<OrganizationUser[]> {
    const params = new URLSearchParams();
    if (options?.size) params.append('size', options.size.toString());
    if (options?.page !== undefined) params.append('page', options.page.toString());
    if (options?.sort) params.append('sort', options.sort);

    const queryString = params.toString();
    const url = `${baseUrl}/api/organizations/${organizationId}/members${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error al listar miembros: ${errorText || res.statusText}`);
    }
    return res.json();
}

/**
 * Contar miembros de una organización (todos)
 * GET /api/organizations/{organizationId}/members/count
 */
export async function contarMiembros(organizationId: string, token: string): Promise<MembersCountResponse> {
    const res = await fetch(`${baseUrl}/api/organizations/${organizationId}/members/count`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error al contar miembros: ${errorText || res.statusText}`);
    }
    return res.json();
}

/**
 * Contar miembros de una organización por status
 * GET /api/organizations/{organizationId}/members/count?status=ACTIVE
 */
export async function contarMiembrosPorStatus(
    organizationId: string,
    status: string,
    token: string
): Promise<MembersCountResponse> {
    const res = await fetch(
        `${baseUrl}/api/organizations/${organizationId}/members/count?status=${encodeURIComponent(status)}`,
        {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }
    );
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error al contar miembros por status: ${errorText || res.statusText}`);
    }
    return res.json();
}

/**
 * Agregar miembro a organización
 * POST /api/organizations/{organizationId}/members
 */
export async function agregarMiembro(
    organizationId: string,
    data: AddMemberRequest,
    token: string
): Promise<OrganizationUser> {
    const res = await fetch(`${baseUrl}/api/organizations/${organizationId}/members`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error al agregar miembro: ${errorText || res.statusText}`);
    }
    return res.json();
}
