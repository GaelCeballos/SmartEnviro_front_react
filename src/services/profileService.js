/**
 * Servicio para gestionar el perfil y seguridad del usuario (PRODUCCIÓN)
 */

const API_URL = 'https://smart-enviro-api.onrender.com';

/**
 * MOTOR CENTRAL DE PETICIONES PRIVADAS
 */
const apiRequest = async (endpoint, method = 'GET', body = null) => {
  try {
    const token = localStorage.getItem('auth_token')?.replace(/['"]+/g, '');
    
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    const contentType = response.headers.get("content-type");
    let data = {};
    
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      console.warn(`⚠️ [profileService] Respuesta HTML en ${endpoint} (${response.status})`);
      return { ok: false, data: { message: `Error del servidor (Código ${response.status}).` } };
    }
    
    return { ok: response.ok, data };
  } catch (error) {
    console.error(`❌ Error de red en profileService [${method} ${endpoint}]:`, error);
    return { ok: false, data: { message: 'No se pudo conectar con el servidor.' } };
  }
};

// 1. Actualizar datos básicos (nombre, email, etc.)
// Nota: Puedes seguir pasándole (token, payload) o solo (payload); el servicio se adapta.
export const updateProfileInfo = (...args) => {
  const payload = args.length === 2 ? args[1] : args[0];
  return apiRequest('/api/user/profile', 'PUT', payload);
};

//Actualizar contraseña del usuario
export const updateProfilePassword = (...args) => {
  const payload = args.length === 2 ? args[1] : args[0];
  return apiRequest('/api/user/password', 'PUT', payload);
};