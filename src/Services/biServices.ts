import { url as baseUrl } from "./api";

export interface Documento {
  analysis_duration_ms: number;
  char_count: number;
  cluster_id: number;
  createdAt: string; 
  documento_id: number;
  estado: string;
  line_count: number;
  nombre_archivo: string;
  page_count: number;
  proyecto_id: number;
  riesgo_label: string;
  score_plagio: number;
  storage_key: string;
  updatedAt: string;
  word_count: number;
}

export interface KpiDistribucionRiesgo {
  "Riesgo Alto (71-100%)": number;
  "Riesgo Medio (26-70%)": number;
  "Riesgo Bajo (0-25%)": number;
}

export interface Kpis {
  kpi_distribucion_riesgo: KpiDistribucionRiesgo;
  kpi_documentos_procesados: number;
  kpi_plagio_promedio: number;
  kpi_tiempo_promedio_seg: number;
  kpi_total_paginas_analizadas: number;
  kpi_total_palabras_analizadas: number;
}

export interface BiProjectResponse {
  documentos: Documento[];
  kpis: Kpis;
}

export type BiUserKpisResponse = Kpis;

export interface HistorialItem {
  fecha: string;            
  promedio_plagio: number;
  total_documentos: number;
}

export type BiUserHistorialResponse = HistorialItem[];

export type BiUserTopRiesgoResponse = HistorialItem[];

export type HistorialGlobalResponse = HistorialItem[];

export interface RiesgoTrendItem {
  Alto: number;
  Medio: number;
  Bajo: number;
}
export type BiUserRiesgoTrendsResponse = Record<string, RiesgoTrendItem>;


/**
 * Función auxiliar para crear las cabeceras de autenticación
 */
const getAuthHeaders = (token: string) => {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

/**
 * Wrapper genérico para las peticiones fetch de BI
 */
const fetchBiData = async <T>(url: string, token: string): Promise<T> => {
  const headers = getAuthHeaders(token);
  const response = await fetch(url, { method: 'GET', headers });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.message || `Error ${response.status}: ${response.statusText}`
    );
  }
  return response.json() as Promise<T>;
};


/**
 * Obtiene los KPIs para el usuario autenticado (profesor)
 * @route GET /api/bi/org/:orgId/kpis/byUser
 */
export const getKpisByUser = (orgId: string, token: string): Promise<BiUserKpisResponse> => {
  const url = `${baseUrl}/api/bi/org/${orgId}/kpis/byUser`;
  return fetchBiData<BiUserKpisResponse>(url, token);
};

/**
 * Obtiene el historial de análisis para el usuario autenticado
 * @route GET /api/bi/org/:orgId/historial/byUser
 */
export const getHistorialByUser = (orgId: string, token: string): Promise<BiUserHistorialResponse> => {
  const url = `${baseUrl}/api/bi/org/${orgId}/historial/byUser`;
  return fetchBiData<BiUserHistorialResponse>(url, token);
};

/**
 * Obtiene el top 5 de riesgo para el usuario autenticado
 * @route GET /api/bi/org/:orgId/top-riesgo/byUser
 */
export const getTopRiesgoByUser = (orgId: string, token: string): Promise<BiUserTopRiesgoResponse> => {
  const url = `${baseUrl}/api/bi/org/${orgId}/top-riesgo/byUser`;
  return fetchBiData<BiUserTopRiesgoResponse>(url, token);
};

// --- API de BI para Administradores y Proyectos ---

/**
 * Obtiene los KPIs globales (para un rol de ADMIN)
 * @route GET /api/bi/org/:orgId/kpis-globales
 */
export const getKpisGlobales = (orgId: string, token: string): Promise<BiUserKpisResponse> => {
  const url = `${baseUrl}/api/bi/org/${orgId}/kpis-globales`;
  return fetchBiData<BiUserKpisResponse>(url, token);
};

/**
 * Obtiene los KPIs para un proyecto específico
 * @route GET /api/bi/org/:orgId/kpis/byProject/:projectId
 */
export const getKpisByProject = (orgId: string, projectId: number | string, token: string): Promise<BiProjectResponse> => {
  const url = `${baseUrl}/api/bi/org/${orgId}/kpis/byProject/${projectId}`;
  return fetchBiData<BiProjectResponse>(url, token);
};

/**
 * Historial global de 7 días (ADMIN)
 * @route GET /api/bi/org/:orgId/historial/global
 */
export const getHistorialGlobal = (orgId: string, token: string): Promise<HistorialGlobalResponse> => {
  const url = `${baseUrl}/api/bi/org/${orgId}/historial/global`;
  return fetchBiData<HistorialGlobalResponse>(url, token);
};

/**
 * Historial por proyecto con filtros de fecha opcionales
 * @route GET /api/bi/org/:orgId/historial/proyecto/:proyectoId
 */
export const getHistorialByProject = (
  orgId: string,
  proyectoId: number | string,
  token: string,
  params: { start_date?: string; end_date?: string } = {}
): Promise<BiUserHistorialResponse> => {
  
  const queryParams = new URLSearchParams();
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  
  const queryString = queryParams.toString();
  const url = `${baseUrl}/api/bi/org/${orgId}/historial/proyecto/${proyectoId}${queryString ? `?${queryString}` : ''}`;
  
  return fetchBiData<BiUserHistorialResponse>(url, token);
};

/**
 * Trends de riesgo por usuario (query param: period=monthly|weekly)
 * @route GET /api/bi/org/:orgId/trends/riesgo/usuario/:usuarioId
 */
export const getTrendsRiesgoByUser = (
  orgId: string,
  usuarioId: number | string,
  token: string,
  period: 'monthly' | 'weekly' = 'monthly'
): Promise<BiUserRiesgoTrendsResponse> => {

  const queryParams = new URLSearchParams({ period });
  const url = `${baseUrl}/api/bi/org/${orgId}/trends/riesgo/usuario/${usuarioId}?${queryParams.toString()}`;

  return fetchBiData<BiUserRiesgoTrendsResponse>(url, token);
};