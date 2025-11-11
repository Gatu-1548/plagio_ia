
const API_BASE = "https://gateway-microservice-d5ccehh0ajaqgcd0.canadacentral-01.azurewebsites.net";

/**
 * Registro de usuario
 * @param {string} email
 * @param {string} password
 * @returns token
 */
export async function registerUser(email: any, password: any) {
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error("Error al registrar usuario");
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error("registerUser error:", error);
    throw error;
  }
}

/**
 * Login de usuario
 * @param {string} email
 * @param {string} password
 * @returns token
 */
export async function loginUser(email: any, password: any) {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error("Error al iniciar sesión");
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error("loginUser error:", error);
    throw error;
  }
}


/**
 * 🔒 Obtiene todos los usuarios (solo para ROLE_ADMIN)
 */
export async function getAllUsers() {
  try {
    const token = sessionStorage.getItem("token");
    const response = await fetch(`${API_BASE}/api/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Error al obtener los usuarios");
    }

    return await response.json();
  } catch (error) {
    console.error("getAllUsers error:", error);
    throw error;
  }
}

/**
 * 🔍 Obtiene un usuario por ID
 */
export async function getUserById(id: number) {
  try {
    const token = sessionStorage.getItem("token");
    const response = await fetch(`${API_BASE}/api/users/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Error al obtener el usuario por ID");
    }

    return await response.json();
  } catch (error) {
    console.error("getUserById error:", error);
    throw error;
  }
}

/**
 * ✉️ Obtiene un usuario por email
 */
export async function getUserByEmail(email: string) {
  try {
    const token = sessionStorage.getItem("token");
    const response = await fetch(`${API_BASE}/api/users/by-email/${email}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Error al obtener usuario por email");
    }

    return await response.json();
  } catch (error) {
    console.error("getUserByEmail error:", error);
    throw error;
  }
}

/**
 * ➕ Crear un nuevo usuario
 */
export async function createUser(email: string, password: string, role: string, enabled: boolean = true) {
  try {
    const token = sessionStorage.getItem("token");
    const response = await fetch(`${API_BASE}/api/users/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password, role, enabled })
    });

    if (!response.ok) {
      throw new Error("Error al crear usuario");
    }

    return await response.json();
  } catch (error) {
    console.error("createUser error:", error);
    throw error;
  }
}

/**
 * ✏️ Editar usuario por ID
 */
export async function updateUser(id: number, email: string, password: string, role: string, enabled: boolean = true) {
  try {
    const token = sessionStorage.getItem("token");
    const response = await fetch(`${API_BASE}/api/users/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password, role, enabled })
    });

    if (!response.ok) {
      throw new Error("Error al actualizar usuario");
    }

    return await response.json();
  } catch (error) {
    console.error("updateUser error:", error);
    throw error;
  }
}

/**
 * ❌ Eliminar usuario por email
 */
export async function deleteUserByEmail(email: string) {
  try {
    const token = sessionStorage.getItem("token");
    if (!token || token === "null" || token.trim() === "") {
      const err = new Error("No auth token found in sessionStorage. Inicia sesión antes de realizar esta acción.");
      console.error("deleteUserByEmail error: no token");
      throw err;
    }

    const response = await fetch(`${API_BASE}/api/users/by-email/${email}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      // intentar leer cuerpo de error para dar más contexto
      let body: string = "";
      try {
        body = await response.text();
      } catch (e) {
        // ignore
      }
      const err = new Error(`Error al eliminar usuario (status ${response.status}): ${body}`);
      console.error("deleteUserByEmail error:", { status: response.status, body });
      throw err;
    }

    return await response.text(); // Puede devolver un mensaje
  } catch (error) {
    console.error("deleteUserByEmail error:", error);
    throw error;
  }
}


export async function eliminarUsuarioPorEmail(email: string): Promise<void> {
   const token = sessionStorage.getItem("token");
    const res = await fetch(`${API_BASE}/api/users/by-email/${encodeURIComponent(email)}`, {
      
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error al eliminar usuario: ${errorText || res.statusText}`);
    }
}