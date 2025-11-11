import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Users, BarChart3, FileText, Shield, CreditCard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { obtenerUsuarios } from "@/Services/userServices";
import { listarOrganizaciones } from "@/Services/organizationServices";
import { listarPlanes } from "@/Services/planServices";
import { useQuery } from "@apollo/client/react";
import { GET_ALL_DOCS } from "@/Services/proyectosGraphQL";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import GestionUsuarios from "./GestionUsuarios";
import GestionOrganizaciones from "./GestionOrganizaciones";
import GestionPlanes from "./GestionPlanes";
import GestionDocumentos from "./GestionDocumentos";

export default function SistemaGestionEmpresarial() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [activeSection, setActiveSection] = useState<string>("dashboard");
  const [totalUsuarios, setTotalUsuarios] = useState<number>(0);
  const [usuariosActivos, setUsuariosActivos] = useState<number>(0);
  const [totalOrganizaciones, setTotalOrganizaciones] = useState<number>(0);
  const [totalPlanes, setTotalPlanes] = useState<number>(0);
  const [planesActivos, setPlanesActivos] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Query para obtener documentos
  const { data: documentosData, loading: loadingDocs } = useQuery<{ getAllDocumentos: any[] }>(GET_ALL_DOCS, {
    fetchPolicy: "network-only",
    skip: activeSection !== "dashboard",
  });

  useEffect(() => {
    if (token && activeSection === "dashboard") {
      fetchDashboardStats();
    }
  }, [token, activeSection]);

  const fetchDashboardStats = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Obtener estadísticas de usuarios
      const usuarios = await obtenerUsuarios(token);
      setTotalUsuarios(usuarios.length);
      setUsuariosActivos(usuarios.filter((u) => u.enabled).length);

      // Obtener estadísticas de organizaciones
      const organizaciones = await listarOrganizaciones(token);
      setTotalOrganizaciones(organizaciones.length);

      // Obtener estadísticas de planes
      const planes = await listarPlanes(token);
      setTotalPlanes(planes.length);
      setPlanesActivos(planes.filter((p) => p.active).length);
    } catch (err) {
      console.error("Error al obtener estadísticas:", err);
    } finally {
      setLoading(false);
    }
  };

  const documentos = documentosData?.getAllDocumentos || [];
  const totalDocumentos = documentos.length;
  const documentosCompletados = documentos.filter((d) => d.estado === "COMPLETADO").length;
  const documentosProcesando = documentos.filter((d) => d.estado === "PROCESANDO" || d.estado === "EN_PROCESO").length;
  const documentosConError = totalDocumentos - documentosCompletados - documentosProcesando;

  // Datos para gráficos
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  // Distribución de usuarios
  const usuariosData = [
    { name: "Activos", value: usuariosActivos },
    { name: "Inactivos", value: totalUsuarios - usuariosActivos },
  ];

  // Distribución de documentos por estado
  const documentosChartData = [
    { name: "Completados", value: documentosCompletados },
    { name: "Procesando", value: documentosProcesando },
    { name: "Con Error", value: documentosConError },
  ];

  // Top organizaciones por cantidad de miembros (si tenemos los datos)
  const [organizacionesConMiembros, setOrganizacionesConMiembros] = useState<any[]>([]);

  useEffect(() => {
    if (token && activeSection === "dashboard" && totalOrganizaciones > 0) {
      fetchOrganizacionesConMiembros();
    }
  }, [token, activeSection, totalOrganizaciones]);

  const fetchOrganizacionesConMiembros = async () => {
    if (!token) return;
    try {
      const orgs = await listarOrganizaciones(token);
      const orgsData = orgs.slice(0, 5).map((org) => ({
        name: org.name.length > 15 ? org.name.substring(0, 15) + "..." : org.name,
        miembros: org.members?.length || 0,
      }));
      setOrganizacionesConMiembros(orgsData);
    } catch (err) {
      console.error("Error al obtener organizaciones:", err);
    }
  };

  const sections = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: BarChart3,
      description: "Vista general del sistema empresarial"
    },
    {
      id: "organizaciones",
      title: "Organizaciones",
      icon: Building2,
      description: "Gestión de organizaciones"
    },
    {
      id: "usuarios",
      title: "Usuarios",
      icon: Users,
      description: "Administración de usuarios"
    },
    {
      id: "documentos",
      title: "Documentos",
      icon: FileText,
      description: "Gestión de documentos"
    },
    {
      id: "seguridad",
      title: "Planes",
      icon: CreditCard,
      description: "Gestion de Planes"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Volver"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sistema de Gestión Empresarial</h1>
                <p className="text-sm text-gray-500">Panel de administración del sistema</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Administrador</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navegación por secciones */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    activeSection === section.id
                      ? "border-indigo-600 bg-indigo-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        activeSection === section.id
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{section.title}</h3>
                      <p className="text-sm text-gray-500">{section.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenido de la sección activa */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h2>
                <p className="text-sm text-gray-500">Vista general del sistema empresarial</p>
              </div>

              {loading || loadingDocs ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  {/* Estadísticas principales */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm text-gray-500">Organizaciones</div>
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-800">{totalOrganizaciones}</div>
                        <div className="text-xs text-gray-400">Total registradas</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm text-gray-500">Usuarios</div>
                          <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-800">{totalUsuarios}</div>
                        <div className="text-xs text-gray-400">
                          {usuariosActivos} activos de {totalUsuarios} totales
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm text-gray-500">Planes</div>
                          <CreditCard className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-800">{totalPlanes}</div>
                        <div className="text-xs text-gray-400">
                          {planesActivos} activos de {totalPlanes} totales
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm text-gray-500">Documentos</div>
                          <FileText className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-800">{totalDocumentos}</div>
                        <div className="text-xs text-gray-400">
                          {documentosCompletados} completados, {documentosProcesando} procesando
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Estadísticas secundarias */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Resumen de Usuarios</CardTitle>
                        <CardDescription>Distribución de usuarios en el sistema</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Total de usuarios</span>
                            <span className="text-lg font-semibold">{totalUsuarios}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Usuarios activos</span>
                            <span className="text-lg font-semibold text-green-600">{usuariosActivos}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Usuarios inactivos</span>
                            <span className="text-lg font-semibold text-gray-400">
                              {totalUsuarios - usuariosActivos}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Resumen de Documentos</CardTitle>
                        <CardDescription>Estado de los documentos procesados</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Total de documentos</span>
                            <span className="text-lg font-semibold">{totalDocumentos}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Completados</span>
                            <span className="text-lg font-semibold text-green-600">{documentosCompletados}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">En proceso</span>
                            <span className="text-lg font-semibold text-yellow-600">{documentosProcesando}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Con errores</span>
                            <span className="text-lg font-semibold text-red-600">
                              {totalDocumentos - documentosCompletados - documentosProcesando}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Gráficos */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Distribución de Usuarios (Pie Chart) */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Distribución de Usuarios</CardTitle>
                        <CardDescription>Usuarios activos vs inactivos en el sistema</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={usuariosData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) =>
                                `${name} ${((percent || 0) * 100).toFixed(0)}%`
                              }
                            >
                              {usuariosData.map((entry, index) => (
                                <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Distribución de Documentos (Pie Chart) */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Estado de Documentos</CardTitle>
                        <CardDescription>Distribución de documentos por estado de procesamiento</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={documentosChartData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) =>
                                `${name} ${((percent || 0) * 100).toFixed(0)}%`
                              }
                            >
                              {documentosChartData.map((entry: any, index: number) => (
                                <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Gráfico de Organizaciones */}
                  {organizacionesConMiembros.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Top Organizaciones por Miembros</CardTitle>
                        <CardDescription>Las 5 organizaciones con más miembros</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={organizacionesConMiembros}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="miembros" fill="#8884d8" name="Miembros" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Comparación General (Bar Chart) */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Comparación General del Sistema</CardTitle>
                      <CardDescription>Resumen de las principales entidades del sistema</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={[
                            { name: "Organizaciones", cantidad: totalOrganizaciones },
                            { name: "Usuarios", cantidad: totalUsuarios },
                            { name: "Planes", cantidad: totalPlanes },
                            { name: "Documentos", cantidad: totalDocumentos },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="cantidad" fill="#8884d8" name="Cantidad" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}

          {activeSection === "organizaciones" && <GestionOrganizaciones />}

          {activeSection === "usuarios" && <GestionUsuarios />}

          {activeSection === "documentos" && <GestionDocumentos />}

          {activeSection === "seguridad" && <GestionPlanes />}

          {activeSection === "configuracion" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuración del Sistema</h2>
              <p className="text-gray-600">Ajustes generales y configuración del sistema.</p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Funcionalidad en desarrollo...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

