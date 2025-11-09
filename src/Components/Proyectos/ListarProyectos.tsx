
import { useQuery } from "@apollo/client/react"; 
import { GET_PROYECTOS_POR_USUARIO } from "../../Services/proyectosGraphQL";


const userId = Number(sessionStorage.getItem("userId"));
interface Proyecto {
  proyecto_id: string;
  nombre: string;
}


interface GetProyectosPorUsuarioData {
  getProyectosPorUsuario: Proyecto[];
}

interface GetProyectosPorUsuarioVars {
  usuario_id: number;
}

export default function ListarProyectos() {
  
  const { loading, error, data } = useQuery<
    GetProyectosPorUsuarioData,
    GetProyectosPorUsuarioVars
  >(GET_PROYECTOS_POR_USUARIO, {
    variables: { usuario_id: userId },
  });

  if (loading) return <p>Cargando proyectos...</p>;
  if (error) return <p>Error: {error.message}</p>;

 
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