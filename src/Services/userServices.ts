import { url as baseUrl } from "./api";

export interface Authority {
    authority: string;
}

export interface UserResponse {
    id: number;
    email: string;
    password: string;
    role: string;
    enabled: boolean;
    username: string;
    authorities: Authority[];
    credentialsNonExpired: boolean;
    accountNonExpired: boolean;
    accountNonLocked: boolean;
}

export interface CreateUserRequest {
    email: string;
    password: string;
    role?: string;
    enabled?: boolean;
}

export interface UpdateUserRequest {
    email: string;
    password: string;
    role?: string;
    enabled?: boolean;
}

/**
 * Obtener todos los usuarios (solo ROLE_ADMIN)
 * GET /api/users
 */
export async function obtenerUsuarios(token: string): Promise<UserResponse[]> {
    const res = await fetch(`${baseUrl}/api/users`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error al obtener usuarios: ${errorText || res.statusText}`);
    }
    return res.json();
}

/**
 * Obtener usuario por ID
 * GET /api/users/{id}
 */
export async function obtenerUsuarioPorId(id: number, token: string): Promise<UserResponse> {
    const res = await fetch(`${baseUrl}/api/users/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error al obtener usuario: ${errorText || res.statusText}`);
    }
    return res.json();
}

/**
 * Obtener usuario por email
 * GET /api/users/by-email/{email}
 */
export async function obtenerUsuarioPorEmail(email: string, token: string): Promise<UserResponse> {
    const res = await fetch(`${baseUrl}/api/users/by-email/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error al obtener usuario por email: ${errorText || res.statusText}`);
    }
    return res.json();
}

/**
 * Crear usuario
 * POST /api/users/
 */
export async function crearUsuario(data: CreateUserRequest, token: string): Promise<UserResponse> {
    const res = await fetch(`${baseUrl}/api/users/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error al crear usuario: ${errorText || res.statusText}`);
    }
    return res.json();
}

/**
 * Editar usuario
 * PUT /api/users/{id}
 */
export async function editarUsuario(id: number, data: UpdateUserRequest, token: string): Promise<UserResponse> {
    const res = await fetch(`${baseUrl}/api/users/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error al editar usuario: ${errorText || res.statusText}`);
    }
    return res.json();
}

/**
 * Eliminar usuario por email
 * DELETE /api/users/by-email/{email}
 */
export async function eliminarUsuarioPorEmail(email: string, token: string): Promise<void> {
    const url = `${baseUrl}/api/users/by-email/${encodeURIComponent(email)}`;
    // logging mínimo para debugging (no en producción)
    try {
        const masked = token ? `${token.slice(0,10)}...${token.slice(-10)}` : '<no-token>';
        console.debug('userServices.eliminarUsuarioPorEmail ->', { url, auth: `Bearer ${masked}` });
    } catch (e) {
        // ignore
    }

    const res = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error al eliminar usuario: ${errorText || res.statusText}`);
    }
}

