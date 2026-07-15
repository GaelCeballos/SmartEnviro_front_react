const API_URL = 'https://254f-200-56-155-6.ngrok-free.app';

export const getNotifications = async (token) => {
  try {
    const cleanToken = token ? token.replace(/['\"]+/g, '') : '';
    const res = await fetch(`${API_URL}/api/notifications`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${cleanToken}`,
        'ngrok-skip-browser-warning': 'true',
      },
    });
    const data = await res.json();
    return { ok: res.ok, data };
  } catch (error) {
    console.error('notificationService.getNotifications', error);
    return { ok: false, data: { message: 'No se pudo conectar con el servidor.' } };
  }
};

export const markNotificationRead = async (token, id) => {
  try {
    const cleanToken = token ? token.replace(/['\"]+/g, '') : '';
    const res = await fetch(`${API_URL}/api/notifications/${id}/read`, {
      method: 'PATCH', 
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${cleanToken}`,
        'ngrok-skip-browser-warning': 'true',
      },
    });
    const data = await res.json();
    return { ok: res.ok, data };
  } catch (error) {
    console.error('notificationService.markNotificationRead', error);
    return { ok: false, data: { message: 'No se pudo conectar con el servidor.' } };
  }
};

export const markAllNotificationsRead = async (token) => {
  try {
    const cleanToken = token ? token.replace(/['\"]+/g, '') : '';
    const res = await fetch(`${API_URL}/api/notifications/read-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${cleanToken}`,
        'ngrok-skip-browser-warning': 'true',
      },
    });
    const data = await res.json();
    return { ok: res.ok, data };
  } catch (error) {
    console.error('notificationService.markAllNotificationsRead', error);
    return { ok: false, data: { message: 'No se pudo conectar con el servidor.' } };
  }
};

export default { getNotifications, markNotificationRead, markAllNotificationsRead };
