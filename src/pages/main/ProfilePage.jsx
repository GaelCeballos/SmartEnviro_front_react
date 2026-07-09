import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Shield, Settings, LogOut, ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { BottomNav } from '../../components/layout/BottomNav';

// 1. Importamos la función de logout
import { logoutUser } from '../../services/authService';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Recuperamos los datos del usuario logueado para mostrarlos en la tarjeta
  const userDataString = localStorage.getItem('user_data');
  const user = userDataString ? JSON.parse(userDataString) : { name: 'Usuario', email: 'Sin correo' };

  // 2. Función para manejar el cierre de sesión
  const handleLogout = async () => {
    setIsLoggingOut(true);
    const token = localStorage.getItem('auth_token');

    // Si hay un token, le avisamos a Laravel para que lo destruya
    if (token) {
      await logoutUser(token);
    }

    // Sin importar si Laravel respondió bien o mal (ej. sin internet), 
    // borramos los datos locales y mandamos al usuario al login
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FA] relative">
      
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-[28px] font-extrabold text-[#1F2937]">
          Perfil
        </h1>
      </div>

      {/* Contenido (Deslizable) */}
      <div className="px-6 flex flex-col space-y-4 overflow-y-auto pb-28">
        
        {/* Tarjeta de Usuario (Datos Reales) */}
        <Card className="flex items-center p-4 shadow-sm border-0 bg-white rounded-2xl mb-2">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mr-4">
            <User className="text-white" size={28} strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <span className="text-[#1F2937] font-bold text-[17px] capitalize">{user.name}</span>
            <span className="text-slate-500 text-[14px]">{user.email}</span>
          </div>
        </Card>

        {/* Menú: Notificaciones */}
        <Card 
          onClick={() => navigate('/perfil/notificaciones')}
          className="flex items-center justify-between p-4 shadow-sm border-0 bg-white rounded-2xl active:bg-slate-50 cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <Bell className="text-primary" size={30} />
            <span className="text-[#1F2937] font-semibold text-[15px]">Notificaciones</span>
          </div>
          <ChevronRight className="text-slate-400" size={40} />
        </Card>

        {/* Menú: Configuración */}
        <Card 
          onClick={() => navigate('/perfil/configuracion')}
          className="flex items-center justify-between p-4 shadow-sm border-0 bg-white rounded-2xl active:bg-slate-50 cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <Settings className="text-primary" size={30} />
            <span className="text-[#1F2937] font-semibold text-[15px]">Configuración</span>
          </div>
          <ChevronRight className="text-slate-400" size={40} />
        </Card>

        {/* Botón Cerrar Sesión */}
        <Card 
          onClick={handleLogout}
          className={`flex items-center p-4 shadow-sm border-0 bg-white rounded-2xl mt-2 ${isLoggingOut ? 'opacity-50' : 'active:bg-red-50 cursor-pointer'}`}
        >
          <div className="flex items-center gap-4">
            <LogOut className="text-red-500" size={40} />
            <span className="text-red-600 font-semibold text-[17px]">
              {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
            </span>
          </div>
        </Card>

      </div>

      {/* Navegación Inferior */}
      <BottomNav />
      
    </div>
  );
};