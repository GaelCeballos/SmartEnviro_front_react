const API_URL = ' https://fdd4-200-56-155-6.ngrok-free.app';

export const getUserDevices = async () => {
  try {
    const token = localStorage.getItem('auth_token')?.replace(/['"]+/g, '');
    
    const response = await fetch(`${API_URL}/api/my-devices`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': `Bearer ${token}` 
      }
    });

    const data = await response.json();
    return { ok: response.ok, data };
    
  } catch (error) {
    console.error("Error obteniendo dispositivos:", error);
    return { ok: false, data: { message: 'Error de conexión con el servidor.' } };
  }
};
/**
 * Obtiene la lista de dispositivos disponibles para ser vinculados
 * @returns {Promise<{ok: boolean, data: any}>} Un objeto con el estado de la petición y los datos o mensaje de error.
 */
export const getAvailableDevices = async () => {
  try {
    const token = localStorage.getItem('auth_token')?.replace(/['"]+/g, '');
    
    const response = await fetch(`${API_URL}/api/devices/available`, { 
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    return { ok: response.ok, data };
  } catch (error) {
    console.error("Error al buscar dispositivos disponibles:", error);
    return { ok: false, data: { message: 'Error de conexión.' } };
  }
};

/**
 * Vincula un dispositivo a la cuenta del usuario
 * @param {string} deviceId - El ID del dispositivo a vincular
 * @returns {Promise<{ok: boolean, data: any}>} Un objeto con el estado de la petición y los datos o mensaje de error.
 */
export const claimDevice = async (deviceId) => {
  try {
    const token = localStorage.getItem('auth_token')?.replace(/['"]+/g, '');
    
    const response = await fetch(`${API_URL}/api/devices/${deviceId}/add`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    return { ok: response.ok, data };
  } catch (error) {
    console.error("Error al vincular el dispositivo:", error);
    return { ok: false, data: { message: 'Error de conexión.' } };
  }
};

/**
 * Cambia el estado (ON/OFF) de un dispositivo actuador
 * @param {string|number} deviceId - El ID del dispositivo
 * @param {string} state - El nuevo estado ('ON', 'OFF', 'STANDBY')
 * @returns {Promise<{ok: boolean, data: any}>}
 */
export const toggleDeviceState = async (deviceId, state) => {
  try {
    const token = localStorage.getItem('auth_token')?.replace(/['"]+/g, '');
    
    const response = await fetch(`${API_URL}/api/my-devices/${deviceId}/toggle`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ state }) // El backend espera pasar un objeto con la propiedad 'state'
    });

    const data = await response.json();
    return { ok: response.ok, data };
  } catch (error) {
    console.error("Error al cambiar el estado del dispositivo:", error);
    return { ok: false, data: { message: 'Error de conexión.' } };
  }
};