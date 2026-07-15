/**
 * Servicio para gestionar las notificaciones del usuario (PRODUCCIÓN)
 */

const API_URL = 'https://smart-enviro-api.onrender.com';

/**
 * MOTOR CENTRAL DE PETICIONES PRIVADAS
 * Autogestiona el Token y protege la app de errores HTML (500, 502, etc.)
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
      console.warn(`⚠️ [notificationService] Respuesta HTML en ${endpoint} (${response.status})`);
      return { ok: false, data: { message: `Error del servidor (Código ${response.status}).` } };
    }
    
    return { ok: response.ok, data };
  } catch (error) {
    console.error(`❌ Error de red en notificationService [${method} ${endpoint}]:`, error);
    return { ok: false, data: { message: 'No se pudo conectar con el servidor.' } };
  }
};

//Obtener todas las notificaciones
export const getNotifications = () => 
  apiRequest('/api/notifications', 'GET');

// Marcar una notificación específica como leída
export const markNotificationRead = (id) => 
  apiRequest(`/api/notifications/${id}/read`, 'PATCH');

//Marcar todas las notificaciones como leídas
export const markAllNotificationsRead = () => 
  apiRequest('/api/notifications/read-all', 'POST');