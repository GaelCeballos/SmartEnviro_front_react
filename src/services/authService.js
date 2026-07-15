/**
 * Servicio para gestionar la autenticación de usuarios (PRODUCCIÓN)
 * Autor: Gael Ceballos Nava
 */

const API_URL = 'https://smart-enviro-api.onrender.com';

/**
 * Función auxiliar interna para peticiones públicas (Login / Registro)
 * Protege contra errores HTML cuando el servidor de Render está reiniciándose o caído.
 */
const publicRequest = async (endpoint, method = 'POST', body = null) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: body ? JSON.stringify(body) : null
    });

    const contentType = response.headers.get("content-type");
    let data = {};

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const textError = await response.text();
      console.warn(`⚠️ [authService] El servidor respondió HTML en ${endpoint}:`, textError.substring(0, 150));
      return { ok: false, data: { message: `Respuesta inesperada del servidor (Código ${response.status}).` } };
    }

    return { ok: response.ok, data };
  } catch (error) {
    console.error(`❌ Error de red en authService [${method} ${endpoint}]:`, error);
    return { ok: false, data: { message: 'No se pudo conectar con el servidor. Verifica tu conexión.' } };
  }
};

export const loginUser = async (email, password) => {
  const res = await publicRequest('/api/login', 'POST', { email, password });
  
  // Si el login fue exitoso, guardamos el token automáticamente
  if (res.ok) {
    const token = res.data.token || res.data.access_token;
    if (token) {
      localStorage.setItem('auth_token', token);
    }
  }
  return res;
};

export const registerUser = async (name, email, password, password_confirmation) => {
  return publicRequest('/api/register', 'POST', { name, email, password, password_confirmation });
};

export const logoutUser = async (token = null) => {
  try {
    // Si no se pasa el token por parámetro, lo busca automáticamente en localStorage
    const storedToken = token || localStorage.getItem('auth_token');
    const cleanToken = storedToken ? storedToken.replace(/['"]+/g, '') : '';

    const response = await fetch(`${API_URL}/api/logout`, {
      method: 'DELETE', 
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${cleanToken}` 
      }
    });

    // limpiar la sesión local para no dejar al usuario atrapado en el frontend.
    localStorage.removeItem('auth_token');

    let data = {};
    const textResponse = await response.text();
    if (textResponse && response.headers.get("content-type")?.includes("application/json")) {
      data = JSON.parse(textResponse);
    }

    return { ok: response.ok, data };
  } catch (error) {
    console.error("❌ Error en logoutUser:", error);
    localStorage.removeItem('auth_token'); // Limpiamos por seguridad
    return { ok: false, data: { message: 'Sesión cerrada localmente.' } };
  }
};