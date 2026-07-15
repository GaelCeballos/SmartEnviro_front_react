const API_URL = 'https://254f-200-56-155-6.ngrok-free.app';
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
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
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
      // Si el servidor devolvió HTML (error 500, advertencia de Ngrok, etc.)
      const textError = await response.text();
      console.warn("⚠️ Advertencia: El servidor respondió con HTML en lugar de JSON:", textError.substring(0, 200));
      return { 
        ok: false, 
        data: { message: `Respuesta inesperada del servidor (Código ${response.status}).` } 
      };
    }
    
    return { ok: response.ok, data };
  } catch (error) {
    console.error(`Error de red en [${method}] ${endpoint}:`, error);
    return { ok: false, data: { message: 'Error de conexión con el servidor.' } };
  }
};

/**
 * ============================================================================
 * 1. OBTENCIÓN Y CONSULTA DE DISPOSITIVOS
 * ============================================================================
 */

// Obtiene los dispositivos vinculados al usuario (Route::get('/my-devices'))
export const getUserDevices = () => apiRequest('/api/my-devices', 'GET');

// Obtiene el detalle de un dispositivo específico (Route::get('/my-devices/{id}'))
export const getDeviceDetails = (id) => apiRequest(`/api/my-devices/${id}`, 'GET');

//Obtiene las lecturas más recientes en tiempo real de los sensores del dispositivo
export const getDeviceRealTimeData = (deviceId) => 
  apiRequest(`/api/sensor-data?device_id=${deviceId}`, 'GET');

// Obtiene el historial de lecturas (Route::get('sensor-data/history'))
export const getDeviceSensorHistory = (deviceId, sensorTypeKey, filter) => {
  // Traducimos los filtros de la vista al periodo que espera el backend
  const periodMap = {
    '24h': 'day',
    '7d':  'week',
    '30d': 'month'
  };
  const period = periodMap[filter] || 'day';

  return apiRequest(
    `/api/sensor-data/history?device_id=${deviceId}&sensor_type_key=${sensorTypeKey}&period=${period}`, 
    'GET'
  );
};


/**
 * ============================================================================
 * 2. VINCULACIÓN DE NUEVOS DISPOSITIVOS 
 * ============================================================================
 */

/**
 * Busca dispositivos que no pertenecen a nadie y están listos para vincular.
 * Mapea directamente a: Route::get('/devices/available') en tu api.php
 */
export const getAvailableDevices = () => apiRequest('/api/devices/available', 'GET');

/**
 * Enlaza un dispositivo disponible a la cuenta del usuario autenticado.
 * Mapea directamente a: Route::post('/devices/{id}/add') en tu api.php
 */
export const addDevice = (id) => apiRequest(`/api/devices/${id}/add`, 'POST');

// Alias de compatibilidad para evitar el error en la pantalla de login/vinculación
export const claimDevice = addDevice;


/**
 * ============================================================================
 * 3. CONTROL MANUAL Y PROPIEDADES (NÚCLEO DINÁMICO)
 * ============================================================================
 */

// Modifica una propiedad en device_properties (Route::put('/my-devices/{id}/properties'))
export const updateDeviceProperty = (deviceId, propertyKey, propertyValue) => {
  return apiRequest(`/api/my-devices/${deviceId}/properties`, 'PUT', {
    property_key: propertyKey,
    property_value: String(propertyValue)
  });
};

// Modifica la columna física 'current_state' de la tabla 'devices' (Bomba) 
export const togglePumpState = (deviceId, state) => 
  apiRequest(`/api/my-devices/${deviceId}/toggle`, 'POST', { state });

// Modifica la propiedad 'lamp_state' para el Foco usando la estructura dinámica
export const toggleLampState = (deviceId, state) => 
  updateDeviceProperty(deviceId, 'lamp_state', state);


/**
 * ============================================================================
 * 4. GUARDADO DE BLOQUES DE CONFIGURACIÓN
 * ============================================================================
 */

// Actualiza las configuraciones del bloque de Riego (auto_water y humidity_threshold)
export const updateWaterSettings = async (id, settings) => {
  const resAuto = await updateDeviceProperty(id, 'auto_water', settings.auto_water);
  const resThreshold = await updateDeviceProperty(id, 'humidity_threshold', settings.humidity_threshold);
  return { ok: resAuto.ok && resThreshold.ok };
};

// Actualiza las configuraciones del bloque de Iluminación (auto_light y light_threshold)
export const updateLightSettings = async (id, settings) => {
  const resAuto = await updateDeviceProperty(id, 'auto_light', settings.auto_light);
  const resThreshold = await updateDeviceProperty(id, 'light_threshold', settings.light_threshold);
  return { ok: resAuto.ok && resThreshold.ok };
};