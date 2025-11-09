
const API_BASE = "https://gateway-microservice-d5ccehh0ajaqgcd0.canadacentral-01.azurewebsites.net/auth";

/**
 * Registro de usuario
 * @param {string} email
 * @param {string} password
 * @returns token
 */
export async function registerUser(email: any, password: any) {
  try {
    const response = await fetch(`${API_BASE}/register`, {
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
    const response = await fetch(`${API_BASE}/login`, {
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