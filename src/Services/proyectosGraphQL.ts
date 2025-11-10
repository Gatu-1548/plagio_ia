import { gql } from "@apollo/client";

// 🔹 Obtener proyectos por usuario
export const GET_PROYECTOS_POR_USUARIO = gql`
  query GetProyectosPorUsuario($usuario_id: Int!) {
    getProyectosPorUsuario(usuario_id: $usuario_id) {
      proyecto_id
      nombre
    }
  }
`;

// 🔹 Obtener un proyecto por ID
export const GET_PROYECTO = gql`
  query GetProyecto($id: Int!) {
    getProyecto(id: $id) {
      proyecto_id
      nombre
      usuario_id
      documentos {
        documento_id
        nombre_archivo
        estado
        score_plagio
        page_count
        word_count
        analysis_duration_ms
      }
    }
  }
`;

// 🔹 Crear proyecto
export const CREAR_PROYECTO = gql`
  mutation CrearProyecto($nombre: String!, $usuario_id: Int!) {
    crearProyecto(nombre: $nombre, usuario_id: $usuario_id) {
      proyecto_id
      nombre
      usuario_id
    }
  }
`;

export const ACTUALIZAR_PROYECTO = gql`
  mutation ActualizarProyecto($id: Int!, $nombre: String!) {
    actualizarProyecto(id: $id, nombre: $nombre) {
      proyecto_id
      nombre
    }
  }
`;

// 🔹 Eliminar proyecto
export const ELIMINAR_PROYECTO = gql`
  mutation EliminarProyecto($id: Int!) {
    eliminarProyecto(id: $id)
  }
`;