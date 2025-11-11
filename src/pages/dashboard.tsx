import { Badge } from "@/Components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useOrganization } from "@/context/OrganizationContext";
import {
  getKpisGlobales,
  getHistorialGlobal,
  getTopRiesgoByUser,
  type Kpis,
  type HistorialItem, 
} from "@/Services/biServices";
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
} from "recharts";


export default function Dashboard() {
  const { currentOrg } = useOrganization();
  const { token } = useAuth();

  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [topRiesgos, setTopRiesgos] = useState<HistorialItem[]>([]);
  const [loading, setLoading] = useState(true);

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

      setKpis(kpisResponse);
      setHistorial(historialResponse);
      setTopRiesgos(topRiesgoResponse.slice(0, 5)); // Top 5
    } catch (error) {
      console.error("Error fetching BI data:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  const riskData = kpis
    ? [
        { name: "Riesgo Alto", value: kpis.kpi_distribucion_riesgo["Riesgo Alto (71-100%)"] },
        { name: "Riesgo Medio", value: kpis.kpi_distribucion_riesgo["Riesgo Medio (26-70%)"] },
        { name: "Riesgo Bajo", value: kpis.kpi_distribucion_riesgo["Riesgo Bajo (0-25%)"] },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando dashboard...</div>
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
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Proyectos</div>
            <div className="text-2xl font-bold text-gray-800">
              {kpis?.kpi_documentos_procesados ?? 0}
            </div>
            <div className="text-xs text-gray-400">Documentos procesados</div>
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
            <div className="text-sm text-gray-500">Alertas</div>
            <Badge variant="destructive" className="text-lg font-bold">
              {kpis?.kpi_distribucion_riesgo["Riesgo Alto (71-100%)"] ?? 0}
            </Badge>
            <div className="text-xs text-gray-400">Altos riesgos</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Distribución de Riesgo (Pie Chart) */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Riesgo</CardTitle>
          </CardHeader>
          <CardContent>
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
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Historial de Plagio (Line Chart) */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Análisis (7 días)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historial}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="promedio_plagio" stroke="#8884d8" />
                <Line type="monotone" dataKey="total_documentos" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Top Riesgos (Bar Chart) */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Riesgos Recientes</CardTitle>
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