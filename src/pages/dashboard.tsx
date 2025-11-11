import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { useOrganization } from "@/context/OrganizationContext";
import {
  getKpisGlobales,
  getHistorialGlobal,
  getTopRiesgoByUser,
  getKpisByUser,
  getHistorialByUser,
  type HistorialItem,
  type Kpis,
} from "@/Services/biServices";
import { listarMiembros, type OrganizationUser } from "@/Services/organizationServices"; 
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ReferenceLine,
} from "recharts";

interface UserKpi {
  user: OrganizationUser;
  kpis: Kpis;
  historial: HistorialItem[];
}

export default function Dashboard() {
  const { currentOrg } = useOrganization();
  const { token } = useAuth();

  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [topRiesgos, setTopRiesgos] = useState<HistorialItem[]>([]);
  const [members, setMembers] = useState<OrganizationUser[]>([]);
  const [userKpis, setUserKpis] = useState<UserKpi[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);

  useEffect(() => {
    initFetchs();
  }, [currentOrg?.id, token]);

  const initFetchs = async () => {
    if (!currentOrg?.id || !token) return;

    setLoading(true);
    try {
      const [kpisResponse, historialResponse, topRiesgoResponse] = await Promise.all([
        getKpisGlobales(currentOrg.id, token),
        getHistorialGlobal(currentOrg.id, token),
        getTopRiesgoByUser(currentOrg.id, token),
      ]);

      setKpis(kpisResponse ? null : kpisResponse);
      setHistorial(historialResponse ? [] : historialResponse);
      setTopRiesgos(topRiesgoResponse ? [] : topRiesgoResponse);
    } catch (error) {
      setKpis(null);
      setHistorial([]);
      setTopRiesgos([]);
      console.error("Error fetching global BI data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [currentOrg?.id, token]);

  const fetchMembers = async () => {
    if (!currentOrg?.id || !token) return;

    setLoadingMembers(true);
    try {
      const membersResponse = await listarMiembros(currentOrg.id, token, { size: 50, page: 0 });
      const allMembers = membersResponse ? [] : membersResponse;
      if (allMembers.length === 0) {
         setLoadingMembers(false);
         setMembers([]);
         setUserKpis([]);
         return;
      }
      

      const userKpiPromises = allMembers.slice(0, 10).map(async (member) => { 
        try {
          const userKpi = await getKpisByUser(currentOrg.id, token); 
          const historialUser = await getHistorialByUser(currentOrg.id, token);

          if (userKpi) {
            return null; 
          }

          const validHistorial = historialUser ? [] : historialUser;
          
          return { user: member, kpis: userKpi, historial: validHistorial };
        } catch (err) {
          console.error(`Error fetching data for user ${member}:`, err);
          return null;
        }
      });

      const resolvedUserKpis = (await Promise.all(userKpiPromises)).filter(Boolean) as UserKpi[];
      console.log(resolvedUserKpis);
      
      setUserKpis(resolvedUserKpis);
      setMembers(allMembers);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const riskData = kpis
    ? [
        { name: "Riesgo Alto", value: kpis.kpi_distribucion_riesgo["Riesgo Alto (71-100%)"]?? 0 },
        { name: "Riesgo Medio", value: kpis.kpi_distribucion_riesgo["Riesgo Medio (26-70%)"]?? 0},
        { name: "Riesgo Bajo", value: kpis.kpi_distribucion_riesgo["Riesgo Bajo (0-25%)"]?? 0 },
      ]
    : [];

  const userComparisonData = userKpis.map((uk) => ({
    name: uk.user.userId.toString().slice(-4),
    plagio: uk.kpis.kpi_plagio_promedio ?? 0,
    documentos: uk.kpis.kpi_documentos_procesados ?? 0,
  }));

  const aggregatedTrends = historial.map((item) => ({
    fecha: item.fecha,
    plagio: item.promedio_plagio,
  }));

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
          <p className="text-sm text-gray-500">Resumen rápido de tu área de trabajo</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">Filtros</Button>
          <Button size="sm">Nuevo proyecto</Button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Documentos Procesados</div>
            <div className="text-2xl font-bold text-gray-800">
              {kpis?.kpi_documentos_procesados ?? 0}
            </div>
            <div className="text-xs text-gray-400">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Plagio Promedio</div>
            <div className="text-2xl font-bold text-gray-800">
              {kpis?.kpi_plagio_promedio?.toFixed(1) ?? 0}%
            </div>
            <div className="text-xs text-gray-400">
              Tiempo avg: {kpis?.kpi_tiempo_promedio_seg?.toFixed(1) ?? 0}s
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Miembros Activos</div>
            <div className="text-2xl font-bold text-gray-800">
              {members.length}
            </div>
            <div className="text-xs text-gray-400">En la organización</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Distribución de Riesgo (Pie Chart) */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Riesgo</CardTitle>
            <CardDescription>Análisis global de plagio por nivel de riesgo.</CardDescription>
          </CardHeader>
          <CardContent>
            {riskData.length > 0 && riskData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ): (
              <div className="flex h-[300px] w-full items-center justify-center">
                <p className="text-sm text-gray-500">Aún no hay datos de riesgo para mostrar.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comparación de Miembros (Bar Chart) */}
        <Card>
          <CardHeader>
            <CardTitle>Comparación por Miembro</CardTitle>
            <CardDescription>Promedio de plagio por usuario (top 10).</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="plagio" fill="#8884d8" />
                <Bar dataKey="documentos" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Historial Global (Line Chart) */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Análisis (7 días)</CardTitle>
            <CardDescription>Evolución del plagio promedio y documentos procesados.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historial}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="promedio_plagio" stroke="#8884d8" name="Plagio %" />
                <Line yAxisId="right" type="monotone" dataKey="total_documentos" stroke="#82ca9d" name="Documentos" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trends de Riesgo Agregados (Area Chart) */}
        <Card>
          <CardHeader>
            <CardTitle>Trends de Riesgo (Mensual)</CardTitle>
            <CardDescription>Evolución agregada de riesgos por período.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={aggregatedTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="plagio" stroke="#8884d8" fill="#8884d8" />
                <ReferenceLine y={25} label="Bajo" stroke="green" />
                <ReferenceLine y={70} label="Medio" stroke="orange" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Miembros */}
      <Card>
        <CardHeader>
          <CardTitle>Miembros de la Organización</CardTitle>
          <CardDescription>Resumen de usuarios y sus métricas clave.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingMembers ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario ID</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Plagio Prom.</TableHead>
                    <TableHead>Documentos</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => {
                    const userKpiData = userKpis.find((uk) => uk.user.userId === member.userId);
                    return (
                      <TableRow key={member.id}>
                        <TableCell>{member.userId}</TableCell>
                        <TableCell>
                          <Badge variant={member.role === "ADMIN" ? "default" : "secondary"}>
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={member.status === "ACTIVE" ? "default" : "secondary"}>
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{userKpiData?.kpis.kpi_plagio_promedio?.toFixed(1) ?? "-"}%</TableCell>
                        <TableCell>{userKpiData?.kpis.kpi_documentos_procesados ?? "-"}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => {/* Ver detalles user */}}>
                            Ver Detalles
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top 5 Riesgos (Bar Chart) */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Riesgos Recientes</CardTitle>
          <CardDescription>Análisis de los eventos de mayor riesgo.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topRiesgos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="promedio_plagio" fill="#8884d8" />
              <Bar dataKey="total_documentos" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}