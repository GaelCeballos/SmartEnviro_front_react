const API_URL = 'https://ea8d-200-56-155-6.ngrok-free.app';
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

/**
   * CARGAR EL HISTORIAL DE LAS DOS GRÁFICAS POR SEPARADO
   */
  const fetchHistoryData = async (targetDevice, filter) => {
    const hasHumidity = targetDevice.capabilities?.has_humidity ?? false;
    const hasLuminosity = targetDevice.capabilities?.has_luminosity ?? false;

    //FUNCIÓN PARA CONVERTIR Y FORMATEAR A LA ZONA HORARIA DEL USUARIO
    const formatLocalTime = (serverDateString, currentFilter) => {
      if (!serverDateString) return '';
      // Si envía fecha completa (ej. "2026-07-23 19:03:37"), lo convertimos:
      if (serverDateString.includes('-')) {
        // Reemplazamos espacio por 'T' y agregamos 'Z' si el servidor guarda en UTC, 
        // o déjalo sin 'Z' para que el navegador compense el desfase local:
        const date = new Date(serverDateString.replace(' ', 'T'));
        
        // Formateo según el filtro temporal seleccionado
        if (currentFilter === '24h') {
          // Para vista de un día, solo mostramos la hora local (ej: "07:03 PM")
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
          // Para 7 o 30 días, mostramos día y hora local (ej: "23 Jul, 07:03 PM")
          return date.toLocaleDateString([], { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        }
      }
      return serverDateString;
    };

    try {
      const promises = [];

      if (hasHumidity) {
        promises.push(
          getDeviceSensorHistory(id, 'humedad_suelo', filter).then(res => {
            if (res.ok && res.data?.status === 'success') {
              return {
                type: 'humidity',
                data: res.data.data.map(item => ({
                  // 🔥 Aplicamos la conversión a la etiqueta del eje X
                  timestamp: formatLocalTime(item.label, filter),
                  value: Number(item.value || 0)
                }))
              };
            }
            return { type: 'humidity', data: [] };
          })
        );
      }

      if (hasLuminosity) {
        promises.push(
          getDeviceSensorHistory(id, 'luminosidad', filter).then(res => {
            if (res.ok && res.data?.status === 'success') {
              return {
                type: 'luminosity',
                data: res.data.data.map(item => ({
                  // 🔥 Aplicamos la conversión a la etiqueta del eje X
                  timestamp: formatLocalTime(item.label, filter),
                  value: Number(item.value || 0)
                }))
              };
            }
            return { type: 'luminosity', data: [] };
          })
        );
      }

      const results = await Promise.all(promises);

      results.forEach(result => {
        if (result.type === 'humidity') {
          setHumidityChartData(result.data);
        } else if (result.type === 'luminosity') {
          setLightChartData(result.data);
        }
      });

    } catch (error) {
      console.error("Error cargando historial de gráficas:", error);
    }
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