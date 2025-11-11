export default function Dashboard(){
    return(
        <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
                <p className="text-sm text-gray-500">Resumen rápido de tu área de trabajo</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-3 py-2 rounded-md bg-white border text-sm text-gray-700 hover:bg-gray-50">Filtros</button>
                <button className="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700">Nuevo proyecto</button>
              </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Proyectos</div>
                <div className="text-2xl font-bold text-gray-800">—</div>
                <div className="text-xs text-gray-400">Actualizado hace 5m</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Documentos</div>
                <div className="text-2xl font-bold text-gray-800">—</div>
                <div className="text-xs text-gray-400">Análisis en progreso: —</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Alertas</div>
                <div className="text-2xl font-bold text-red-600">—</div>
                <div className="text-xs text-gray-400">Revisa los últimos reportes</div>
              </div>
            </div>
        </div>
    )
}