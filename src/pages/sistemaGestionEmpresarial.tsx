import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Users, Settings, BarChart3, FileText, Shield, CreditCard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { obtenerUsuarios } from "@/Services/userServices";
import { listarOrganizaciones } from "@/Services/organizationServices";
import { listarPlanes } from "@/Services/planServices";
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

  useEffect(() => {
    if (token && activeSection === "dashboard") {
      fetchDashboardStats();
    }
  }, [token, activeSection]);

  const fetchDashboardStats = async () => {
    if (!token) return;
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
    } catch (err) {
      console.error("Error al obtener estadísticas:", err);
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
    },
    {
      id: "configuracion",
      title: "Suscripciones",
      icon: Settings,
      description: "Gestion de Suscripciones"
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
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">Organizaciones</span>
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{totalOrganizaciones}</p>
                  <p className="text-xs text-blue-700 mt-1">Total registradas</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-900">Usuarios</span>
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-900">{totalUsuarios}</p>
                  <p className="text-xs text-green-700 mt-1">
                    {usuariosActivos} activos de {totalUsuarios} totales
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-900">Planes</span>
                    <CreditCard className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-900">{totalPlanes}</p>
                  <p className="text-xs text-purple-700 mt-1">Total registrados</p>
                </div>
              </div>
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

