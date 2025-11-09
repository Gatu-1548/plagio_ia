import { gql } from "@apollo/client";

// 🔹 Obtener proyecto por ID
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
      }
    }
  }
`;

// 🔹 Obtener proyectos por usuario
export const GET_PROYECTOS_POR_USUARIO = gql`
  query GetProyectosPorUsuario($usuario_id: Int!) {
    getProyectosPorUsuario(usuario_id: $usuario_id) {
      proyecto_id
      nombre
    }
  }
`;

// 🔹 Obtener documento por ID
export const GET_DOCUMENTO = gql`
  query GetDocumento($id: Int!) {
    getDocumento(id: $id) {
      documento_id
      nombre_archivo
      estado
      score_plagio
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

// 🔹 Actualizar proyecto
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

// 🔹 Eliminar documento
export const ELIMINAR_DOCUMENTO = gql`
  mutation EliminarDocumento($id: Int!) {
    eliminarDocumento(id: $id)
  }
`;