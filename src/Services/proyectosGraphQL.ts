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
  query GetProyecto($id: ID!) {
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
  mutation CrearProyecto($nombre: String!, $usuario_id: Int!, $organizacion_id: String!) {
    crearProyecto(nombre: $nombre, usuario_id: $usuario_id, organizacion_id: $organizacion_id) {
      proyecto_id
      nombre
      usuario_id
      organizacion_id
    }
  }
`;

export const ACTUALIZAR_PROYECTO = gql`
  mutation ActualizarProyecto($id: ID!, $nombre: String!) {
    actualizarProyecto(id: $id, nombre: $nombre) {
      proyecto_id
      nombre
    }
  }
`;

// 🔹 Eliminar proyecto
export const ELIMINAR_PROYECTO = gql`
  mutation EliminarProyecto($id: ID!) {
    eliminarProyecto(id: $id)
  }
`;

// 🔹 Obtener un documento por ID (para polling del worker)
export const GET_DOCUMENTO = gql`
  query GetDocumento($id: ID!) {
    getDocumento(id: $id) {
      documento_id
      nombre_archivo
      estado
      score_plagio
      page_count
      word_count
      analysis_duration_ms
    }
  }
`;

// 🔹 Eliminar documento
export const ELIMINAR_DOCUMENTO = gql`
  mutation EliminarDocumento($id: ID!) {
    eliminarDocumento(id: $id)
  }
`;

// 🔹 Obtener proyectos por usuario y organización
export const GET_PROYECTOS_POR_USUARIO_Y_ORGANIZACION = gql`
  query GetProyectosPorUsuarioYOrganizacion($usuario_id: Int!, $organizacion_id: String!) {
    getProyectosPorUsuarioYOrganizacion(usuario_id: $usuario_id, organizacion_id: $organizacion_id) {
      proyecto_id
      nombre
      organizacion_id
    }
  }
`;

// 🔹 Obtener proyectos por organización (admin)
export const GET_PROYECTOS_POR_ORGANIZACION = gql`
  query GetProyectosPorOrganizacion($organizacion_id: String!) {
    getProyectosPorOrganizacion(organizacion_id: $organizacion_id) {
      proyecto_id
      nombre
      organizacion_id
    }
  }
`;

export const GET_ALL_DOCS = gql`
  query GetAllDocumentos {
    getAllDocumentos {
      documento_id
      nombre_archivo
      estado
      score_plagio
      page_count
      word_count
      analysis_duration_ms
    }
  }
`;