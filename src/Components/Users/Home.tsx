import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Bienvenido a IA_Plagio</h1>
          <p className="text-gray-600 mb-6">
            Analiza y gestiona proyectos y documentos con herramientas de detección de plagio.
            Crea proyectos, sube tus PDFs y revisa los resultados de análisis fácilmente.
          </p>

          <ul className="space-y-2 text-sm text-gray-600 mb-6">
            <li>• Creación y gestión de proyectos.</li>
            <li>• Subida de documentos en PDF y seguimiento.</li>
            <li>• Polling automático para resultados del análisis.</li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center justify-center px-6 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
              aria-label="Iniciar sesión"
            >
              Iniciar sesión
            </button>

            <button
              onClick={() => navigate("/register")}
              className="inline-flex items-center justify-center px-6 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
              aria-label="Registrarse"
            >
              Registrarse
            </button>
          </div>
        </div>

        <div className="w-full md:w-80 shrink-0">
          <div className="aspect-w-4 aspect-h-3 bg-linear-to-br from-indigo-50 to-white rounded-xl flex items-center justify-center p-4 border border-gray-100">
            {/* Simple illustration: SVG */}
            <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="12" width="144" height="96" rx="10" fill="#eef2ff" stroke="#c7d2fe" />
              <rect x="22" y="28" width="116" height="12" rx="3" fill="#6366f1" />
              <rect x="22" y="48" width="90" height="8" rx="3" fill="#a5b4fc" />
              <rect x="22" y="60" width="70" height="8" rx="3" fill="#c7d2fe" />
              <circle cx="126" cy="36" r="12" fill="#7c3aed" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}