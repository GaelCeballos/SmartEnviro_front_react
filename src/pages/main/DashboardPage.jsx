import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Waves, Plus, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { BottomNav } from '../../components/layout/BottomNav';
import { getUserDevices, toggleDeviceState } from '../../services/deviceService';

export const DashboardPage = () => {
  const navigate = useNavigate();

  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hook para cargar los datos al iniciar la pantalla
  useEffect(() => {
    const fetchDevices = async () => {
      setIsLoading(true);
      const { ok, data } = await getUserDevices();

      if (ok && data.status === 'success') {
        const mappedDevices = data.data.map((device) => {
          const isActuator = device.capabilities.has_pump;
          
          return {
            id: device.id,
            name: device.name,
            subtitle: device.is_online ? device.current_state : 'DESCONECTADO',
            type: isActuator ? 'actuator' : 'sensor',
            iconType: device.capabilities.has_humidity ? 'percentage' : 'waves',
            value: device.last_humidity ? `${device.last_humidity}%` : null,
            isActive: device.current_state === 'ON',
          };
        });

        setDevices(mappedDevices);
      } else {
        console.error("Error al cargar dispositivos:", data.message);
      }
      setIsLoading(false);
    };

    fetchDevices();
  }, []);

  // Función centralizada para alternar estado
  const toggleDevice = async (id) => {
    const deviceToUpdate = devices.find(device => device.id === id);
    if (!deviceToUpdate) return;

    const nextState = deviceToUpdate.isActive ? 'OFF' : 'ON';
    
    // Enviamos la petición
    const { ok, data } = await toggleDeviceState(id, nextState);

    // Verificamos el 'success' que manda tu backend
    if (ok && data?.status === 'success') {
      
      // EXTRAEMOS el estado real que te respondió Laravel (ej. "OFF")
      const finalState = data.current_state || nextState;

      setDevices(prevDevices => 
        prevDevices.map(device => 
          device.id === id 
            ? { 
                ...device, 
                isActive: finalState === 'ON', // Se apaga visualmente si es OFF
                subtitle: device.subtitle === 'DESCONECTADO' ? 'DESCONECTADO' : finalState 
              } 
            : device
        )
      );
    } else {
      console.error("No se pudo cambiar el estado:", data);
      alert(data?.message || "Error al intentar cambiar el estado del dispositivo.");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FA] relative">
      
      {/* 1. Top Header */}
      <div className="flex justify-between items-center px-6 pt-12 pb-6">
        <h1 className="text-[28px] font-extrabold text-[#1F2937]">
          Dashboard
        </h1>
        <button 
          onClick={() => navigate('/add-device')}
          className="bg-primary w-11 h-11 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
        >
          <Plus className="text-white" size={26} strokeWidth={2.5} />
        </button>
      </div>

      <div className="px-6 mb-4">
        <h2 className="text-[15px] font-semibold text-slate-500">
          Mis Dispositivos Conectados
        </h2>
      </div>

      {/* 2. Lista de Dispositivos */}
      <div className="px-6 flex flex-col space-y-4 overflow-y-auto pb-28">
        
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="animate-spin text-primary mb-2" size={32} />
            <p className="text-slate-400 text-sm">Cargando dispositivos...</p>
          </div>
        )}

        {!isLoading && devices.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-500 font-medium">No tienes dispositivos vinculados.</p>
          </div>
        )}

        {!isLoading && devices.map((device) => (
          <Card key={device.id} className="flex items-center justify-between p-4 py-5 shadow-sm border-0 bg-white">
            
            <div 
              className="flex items-center gap-4 flex-1 cursor-pointer"
              onClick={() => navigate(`/device/${device.id}`)}
            >
              <div className="w-14 h-14 rounded-2xl bg-[#F4F6F8] flex items-center justify-center flex-shrink-0">
                {device.iconType === 'percentage' && device.value ? (
                  <span className="text-primary font-bold text-lg">{device.value}</span>
                ) : (
                  <Waves className="text-primary" size={24} strokeWidth={2.5} />
                )}
              </div>
              
              <div className="flex flex-col">
                <span className="text-[#1F2937] font-semibold text-[15px] leading-tight">
                  {device.name}
                </span>
                <span className="text-slate-400 text-[13px] mt-1 font-medium">
                  {device.subtitle}
                </span>
              </div>
            </div>

            <div className="pl-2">
              {device.type === 'actuator' ? (
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); 
                    toggleDevice(device.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wider transition-colors duration-200 ${
                    device.isActive 
                      ? 'bg-[#E6F8F5] text-primary' 
                      : 'bg-[#F3F4F6] text-slate-400'
                  }`}
                >
                  {device.isActive ? 'ON' : 'OFF'}
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // <-- ESTO EVITA QUE FALLE
                    toggleDevice(device.id); // <-- USAMOS LA MISMA LÓGICA DE ARRIBA
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wider transition-colors duration-200 ${
                    device.isActive 
                      ? 'bg-[#E6F8F5] text-primary' 
                      : 'bg-[#F3F4F6] text-slate-400 hover:bg-slate-200'
                  }`} 
                >
                  {device.isActive ? 'ON' : 'OFF'}
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* 3. Bottom Navigation */}
      <BottomNav />

    </div>
  );
};