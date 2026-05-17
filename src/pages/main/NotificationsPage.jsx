import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell, Droplets, AlertTriangle, Info } from 'lucide-react';
import { Card } from '../../components/ui/Card';

export const NotificationsPage = () => {
  const navigate = useNavigate();

  const notifications = [
    {
      id: 1,
      type: 'alert',
      title: 'Humedad Crítica',
      message: 'La planta "Terraza" tiene niveles muy bajos (15%).',
      time: 'Hace 5 min',
      icon: <AlertTriangle className="text-red-500" />,
      bg: 'bg-red-50'
    },
    {
      id: 2,
      type: 'action',
      title: 'Riego Completado',
      message: 'El ciclo de riego en "Invernadero" finalizó con éxito.',
      time: 'Hace 1 hora',
      icon: <Droplets className="text-primary" />,
      bg: 'bg-blue-50'
    },
    {
      id: 3,
      type: 'info',
      title: 'Sistema Online',
      message: 'La Estación Meteorológica se ha reconectado.',
      time: 'Hoy, 09:30 AM',
      icon: <Info className="text-slate-400" />,
      bg: 'bg-slate-50'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FA] relative">
      <div className="flex items-center px-6 pt-12 pb-6">
        <button onClick={() => navigate(-1)} className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm">
          <ChevronLeft className="text-slate-600" size={24} />
        </button>
        <h1 className="text-[18px] font-bold text-[#1F2937] ml-4">Notificaciones</h1>
      </div>

      <div className="px-6 flex flex-col space-y-3 overflow-y-auto pb-10">
        {notifications.map((notif) => (
          <Card key={notif.id} className="flex p-4 bg-white border-0 shadow-sm rounded-2xl gap-4">
            <div className={`w-12 h-12 ${notif.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              {notif.icon}
            </div>
            <div className="flex flex-col flex-1">
              <div className="flex justify-between items-start">
                <span className="font-bold text-[#1F2937] text-[15px]">{notif.title}</span>
                <span className="text-slate-400 text-[11px]">{notif.time}</span>
              </div>
              <p className="text-slate-500 text-[13px] mt-1 leading-tight">{notif.message}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};