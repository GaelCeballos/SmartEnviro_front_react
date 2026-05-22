/**
 * Servicio para gestionar los dispositivos del usuario autenticado
 * Autor: Gael Ceballos Nava
 * Descripción: Este servicio se encarga de manejar las peticiones relacionadas con los
 * dispositivos del usuario autenticado, como la obtención de la lista de dispositivos,
 * la configuración de propiedades y el control de los dispositivos.
 */

// ============================================================================
//                     Funciones para DashboardPage
// ============================================================================

const API_URL = 'https://ea7f-177-224-130-250.ngrok-free.app';

/**
 * Obtiene los dispositivos del usuario autenticado
 */
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
 * Cambia el estado del actuador (ON/OFF)
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
      body: JSON.stringify({ state }) 
    });

    const data = await response.json();
    return { ok: response.ok, data };
  } catch (error) {
    console.error("Error al cambiar el estado del dispositivo:", error);
    return { ok: false, data: { message: 'Error de conexión con el servidor.' } };
  }
};

// ============================================================================
//                     Funciones para DeviceDetailPage 
// ============================================================================

/**
 * Obtiene los detalles básicos y las propiedades del dispositivo
 */
export const getDeviceDetails = async (id) => {
  try {
    const token = localStorage.getItem('auth_token')?.replace(/['"]+/g, '');
    
    // Cambiamos /devices/ por /my-devices/
    const response = await fetch(`${API_URL}/api/my-devices/${id}`, {
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
    console.error('Error obteniendo detalles del dispositivo:', error);
    return { ok: false, data: { message: 'Error de conexión con el servidor.' } };
  }
};

/**
 * Obtiene el historial de lecturas de sensores de un dispositivo
 */
export const getDeviceSensorData = async (id) => {
  try {
    const token = localStorage.getItem('auth_token')?.replace(/['"]+/g, '');
    
    const response = await fetch(`${API_URL}/api/sensor-data?device_id=${id}`, {
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
    console.error('Error obteniendo el historial del sensor:', error);
    return { ok: false, data: { message: 'Error de conexión con el servidor.' } };
  }
};

/**
 * Guarda o actualiza las propiedades del Riego Inteligente (auto_water, humidity_threshold)
 */
export const updateDeviceSettings = async (id, settings) => {
  try {
    const token = localStorage.getItem('auth_token')?.replace(/['"]+/g, '');
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      'Authorization': `Bearer ${token}` 
    };

    // 1. Petición para guardar el estado del riego automático (auto_water)
    const resAuto = await fetch(`${API_URL}/api/my-devices/${id}/properties`, {
      method: 'PUT', 
      headers,
      body: JSON.stringify({
        property_key: 'auto_water',
        property_value: settings.auto_water ? 'true' : 'false' // Lo mandamos como string porque es llave-valor
      })
    });

    // 2. Petición para guardar el nivel de humedad (humidity_threshold)
    const resHum = await fetch(`${API_URL}/api/my-devices/${id}/properties`, {
      method: 'PUT', 
      headers,
      body: JSON.stringify({
        property_key: 'humidity_threshold',
        property_value: settings.humidity_threshold.toString() // Convertimos el número a string
      })
    });

    // Validamos que ambas peticiones hayan sido exitosas
    if (!resAuto.ok || !resHum.ok) {
        return { ok: false, data: { message: 'Error al validar las propiedades en el servidor.' } };
    }

    return { ok: true };
    
  } catch (error) {
    console.error('Error guardando configuraciones:', error);
    return { ok: false, data: { message: 'Error de conexión con el servidor.' } };
  }
};

/**
 * Obtiene el historial de lecturas promediadas (agregadas) desde el backend
 */
export const getDeviceSensorHistory = async (id, period, sensorTypeId = 1) => {
  try {
    const token = localStorage.getItem('auth_token')?.replace(/['\"]+/g, '');
    
    const response = await fetch(`${API_URL}/api/sensor-data/history?device_id=${id}&sensor_type_id=${sensorTypeId}&period=${period}`, {
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
    console.error('Error obteniendo el historial promediado del sensor:', error);
    return { ok: false, data: { message: 'Error de conexión con el servidor.' } };
  }
};