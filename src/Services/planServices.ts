import { url as baseUrl } from "./api";

export interface Plan {
    id: string;
    code: string;
    name: string;
    description: string;
    billingInterval: string;
    priceCents: number;
    currency: string;
    limitMembers?: number;
    limitChecks?: number;
    active: boolean;
    createdAt: string;
    updatedAt?: string;
}

export type PlanCreate = Omit<Plan, "id" | "createdAt" | "updatedAt">;

// Listar todos los planes
export async function listarPlanes(token: string): Promise<Plan[]> {
    const headers: HeadersInit = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${baseUrl}/api/plans`, { headers });
    if (!res.ok) throw new Error("Error al listar planes");
    return res.json();
}

// Obtener plan por ID
export async function obtenerPlanPorId(planId: string, token: string): Promise<Plan> {
    const headers: HeadersInit = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${baseUrl}/api/plans/${planId}`, { headers });
    if (!res.ok) throw new Error("Error al obtener plan");
    return res.json();
}

// Crear plan
export async function crearPlan(plan: Omit<Plan, "id" | "createdAt" | "updatedAt">, token: string): Promise<Plan> {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${baseUrl}/api/plans`, {
        method: "POST",
        headers,
        body: JSON.stringify(plan),
    });
    if (!res.ok) throw new Error("Error al crear plan");
    return res.json();
}

// Editar plan (PATCH parcial)
export async function editarPlan(planId: string, data: Partial<Plan>, token: string): Promise<Plan> {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${baseUrl}/api/plans/${planId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al editar plan");
    return res.json();
}

// Habilitar/deshabilitar plan
export async function cambiarEstadoPlan(planId: string, value: boolean, token: string): Promise<Plan> {
    const headers: HeadersInit = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${baseUrl}/api/plans/${planId}/active?value=${value}`, {
        method: "PATCH",
        headers
    });
    if (!res.ok) throw new Error("Error al cambiar estado del plan");
    return res.json();
}

// Eliminar plan
export async function eliminarPlan(planId: string, token: string): Promise<void> {
    const headers: HeadersInit = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${baseUrl}/api/plans/${planId}`, {
        method: "DELETE",
        headers
    });
    if (!res.ok) throw new Error("Error al eliminar plan");
}