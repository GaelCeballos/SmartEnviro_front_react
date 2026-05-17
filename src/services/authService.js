/**
 * Servicio para gestionar la autenticación de usuarios
 * Autor: Gael Ceballos Nava
 * Descripción: Este servicio se encarga de manejar las peticiones relacionadas con la 
 * autenticación, como el inicio de sesión. Aquí se puede agregar funciones para registro, 
 * recuperación de contraseña, etc. según las necesidades de la aplicación.
 */

const API_URL = ' https://fdd4-200-56-155-6.ngrok-free.app'; 

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    // Devolvemos tanto el status de la petición como los datos
    return { ok: response.ok, data };
  } catch (error) {
    console.error("Error en authService:", error);
    // Devolvemos un objeto que simula un error de red para manejarlo fácilmente en la vista
    return { ok: false, data: { message: 'No se pudo conectar con el servidor.' } };
  }
};

export const registerUser = async (name, email, password, password_confirmation) => {
  try {
    const response = await fetch(`${API_URL}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true' // Para saltar la pantalla de ngrok
      },
      body: JSON.stringify({ name, email, password, password_confirmation })
    });

    const data = await response.json();
    return { ok: response.ok, data };
    
  } catch (error) {
    console.error("Error en authService:", error);
    return { ok: false, data: { message: 'No se pudo conectar con el servidor.' } };
  }
};

export const logoutUser = async (token) => {
  try {
    // 1. Limpiamos el token por si viene con comillas ocultas del localStorage
    const cleanToken = token ? token.replace(/['"]+/g, '') : '';

    const response = await fetch(`${API_URL}/api/logout`, {
      method: 'DELETE', 
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': `Bearer ${cleanToken}` 
      }
    });

    let data = {};
    const textResponse = await response.text();
    if (textResponse) {
        data = JSON.parse(textResponse);
    }

    return { ok: response.ok, data };
    
  } catch (error) {
    console.error("Error en authService (logout):", error);
    return { ok: false, data: { message: 'No se pudo conectar con el servidor.' } };
  }
};