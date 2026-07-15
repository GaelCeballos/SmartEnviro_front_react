const API_URL = 'https://d12d-200-56-155-6.ngrok-free.app';

/**
 * MOTOR CENTRAL DE PETICIONES (API REQUEST)
 * Procesa todas las llamadas HTTP inyectando tokens y resolviendo try/catch en un solo lugar.
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
    const data = await response.json();
    
    return { ok: response.ok, data };
  } catch (error) {
    console.error(`Error de red en [${method}] ${endpoint}:`, error);
    return { ok: false, data: { message: 'Error de conexión con el servidor.' } };
  }
};

/**
 * OBTENCIÓN DE DATOS
 */
export const getUserDevices = () => apiRequest('/api/my-devices');
export const getDeviceDetails = (id) => apiRequest(`/api/my-devices/${id}`);
export const getAvailableDevices = () => apiRequest('/api/devices/available');
export const linkDeviceWithAccount = (id) => apiRequest(`/api/devices/${id}/add`, 'POST');

/**
 * HISTORIAL Y GRÁFICAS
 */
export const getDeviceSensorHistory = (deviceId, filter = '24h') => 
  apiRequest(`/api/sensor-data/history?device_id=${deviceId}&filter=${filter}`);

/**
 * NÚCLEO DINÁMICO DE PROPIEDADES (device_properties)
 */
export const updateDeviceProperty = (deviceId, propertyKey, propertyValue) => {
  return apiRequest(`/api/my-devices/${deviceId}/properties`, 'PUT', {
    property_key: propertyKey,
    property_value: String(propertyValue) // La base de datos espera strings
  });
};

/**
 * CONTROL MANUAL DE ACTUADORES
 */
// Modifica la columna física 'current_state' de la tabla 'devices' (Bomba)
export const togglePumpState = (deviceId, state) => 
  apiRequest(`/api/my-devices/${deviceId}/toggle`, 'POST', { state });

// Modifica la propiedad 'lamp_state' en la tabla 'device_properties' (Foco)
export const toggleLampState = (deviceId, state) => 
  updateDeviceProperty(deviceId, 'lamp_state', state);

/**
 * GUARDADO DE BLOQUES DE CONFIGURACIÓN (INDEPENDIENTES)
 */
export const updateWaterSettings = async (id, settings) => {
  const resAuto = await updateDeviceProperty(id, 'auto_water', settings.auto_water);
  const resThreshold = await updateDeviceProperty(id, 'humidity_threshold', settings.humidity_threshold);
  return { ok: resAuto.ok && resThreshold.ok };
};

export const updateLightSettings = async (id, settings) => {
  const resAuto = await updateDeviceProperty(id, 'auto_light', settings.auto_light);
  const resLux = await updateDeviceProperty(id, 'light_threshold', settings.light_threshold);
  return { ok: resAuto.ok && resLux.ok };
};