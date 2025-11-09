
import { useQuery } from "@apollo/client/react"; 
import { GET_PROYECTOS_POR_USUARIO } from "../../Services/proyectosGraphQL";

// 🧠 1️⃣ Define la estructura del dato esperado

const userId = Number(sessionStorage.getItem("userId"));
interface Proyecto {
  proyecto_id: string;
  nombre: string;
}

// 2️⃣ Define el tipo del resultado de la query
interface GetProyectosPorUsuarioData {
  getProyectosPorUsuario: Proyecto[];
}

interface GetProyectosPorUsuarioVars {
  usuario_id: number;
}

export default function ListarProyectos() {
  // 3️⃣ Tipamos useQuery con <Data, Variables>
  const { loading, error, data } = useQuery<
    GetProyectosPorUsuarioData,
    GetProyectosPorUsuarioVars
  >(GET_PROYECTOS_POR_USUARIO, {
    variables: { usuario_id: userId },
  });

  if (loading) return <p>Cargando proyectos...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // 4️⃣ TypeScript ahora entiende que data no es unknown ✅
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Mis Proyectos</h1>
      <ul className="space-y-2">
        {data?.getProyectosPorUsuario.map((proyecto) => (
          <li
            key={proyecto.proyecto_id}
            className="bg-gray-100 p-3 rounded-lg shadow"
          >
            {proyecto.nombre}
          </li>
        ))}
      </ul>
    </div>
  );
}