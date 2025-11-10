import { url as baseUrl } from "./api";

export interface SubscriptionResponse {
    id: string;
    organizationId: string;
    planId: string;
    status: string;
    startDate: string;
    endDate?: string;
    renewsAt: string;
    seatCount: number;
    modelUsesCount: number;
    createdAt: string;
    updatedAt: string;
}

// Crear suscripción para una organización
export async function crearSuscripcion(orgId: string, data: { planId: string; startDate: string; renewsAt: string; seatCount: number }, token: string): Promise<SubscriptionResponse> {
    const res = await fetch(`${baseUrl}/api/organizations/${orgId}/subscriptions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear suscripción');
    return res.json();
}
