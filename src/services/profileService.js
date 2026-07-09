const API_URL = 'https://d12d-200-56-155-6.ngrok-free.app';

export const updateProfileInfo = async (token, payload) => {
  try {
    const cleanToken = token ? token.replace(/['\"]+/g, '') : '';
    const response = await fetch(`${API_URL}/api/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${cleanToken}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return { ok: response.ok, data };
  } catch (error) {
    console.error('profileService.updateProfileInfo', error);
    return { ok: false, data: { message: 'No se pudo conectar con el servidor.' } };
  }
};

export const updateProfilePassword = async (token, payload) => {
  try {
    const cleanToken = token ? token.replace(/['\"]+/g, '') : '';
    const response = await fetch(`${API_URL}/api/user/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${cleanToken}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return { ok: response.ok, data };
  } catch (error) {
    console.error('profileService.updateProfilePassword', error);
    return { ok: false, data: { message: 'No se pudo conectar con el servidor.' } };
  }
};

export default { updateProfileInfo, updateProfilePassword };
