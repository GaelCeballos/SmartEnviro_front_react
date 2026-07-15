import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Waves, Plus, Loader2, Droplet } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { BottomNav } from '../../components/layout/BottomNav';
import { getUserDevices, toggleDeviceState, togglePumpState, toggleLampState } from '../../services/deviceService';

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
          return {
            id: device.id,
            name: device.name,
            subtitle: device.is_online ? device.state || device.current_state : 'DESCONECTADO',
            capabilities: device.capabilities || {},
            last_humidity: device.last_humidity,
            last_luminosity: device.last_luminosity,
            settings: device.settings || {},
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
                <Waves className="text-primary" size={24} strokeWidth={2.5} />
              </div>

              <div className="flex flex-col flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#1F2937] font-semibold text-[15px] leading-tight">{device.name}</span>
                </div>
                <span className="text-slate-400 text-[13px] mt-1 font-medium">{device.subtitle}</span>

                {/* Sensores apilados verticalmente */}
                <div className="mt-3 flex flex-col gap-2">
                  {device.capabilities?.has_humidity && (
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 w-48">
                      <div className="flex items-center gap-2">
                        <Droplet className="text-sky-500" size={16} />
                        <span className="text-sm font-medium text-slate-700">Humedad</span>
                      </div>
                      <div className="text-sm font-bold text-slate-800">{device.last_humidity ?? '--'}%</div>
                    </div>
                  )}

                  {device.capabilities?.has_luminosity && (
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 w-48">
                      <div className="flex items-center gap-2">
                        <Waves className="text-amber-400" size={16} />
                        <span className="text-sm font-medium text-slate-700">Luminosidad</span>
                      </div>
                      <div className="text-sm font-bold text-slate-800">{device.last_luminosity ?? '--'} lx</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pl-2 flex items-center gap-2">
              {device.capabilities?.has_pump && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    // toggle pump independently
                    const current = device.settings?.pump_state || device.settings?.pump_state === 'ON';
                    const next = (device.settings?.pump_state === 'ON') ? 'OFF' : 'ON';
                    togglePumpState(device.id, next).then(res => {
                      if (res.ok) {
                        setDevices(prev => prev.map(d => d.id === device.id ? { ...d, settings: { ...d.settings, pump_state: next } } : d));
                      } else {
                        alert('No se pudo accionar la bomba');
                      }
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-bold tracking-wider bg-[#E6F8F5] text-primary"
                >
                  Bomba
                </button>
              )}

              {device.capabilities?.has_lamp && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = (device.settings?.lamp_state === 'ON') ? 'OFF' : 'ON';
                    toggleLampState(device.id, next).then(res => {
                      if (res.ok) {
                        setDevices(prev => prev.map(d => d.id === device.id ? { ...d, settings: { ...d.settings, lamp_state: next } } : d));
                      } else {
                        alert('No se pudo accionar la luz');
                      }
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-bold tracking-wider bg-[#FFFAEB] text-amber-600"
                >
                  Foco
                </button>
              )}

              {/* Fallback single toggle for legacy devices */}
              {!device.capabilities?.has_pump && !device.capabilities?.has_lamp && (
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggleDevice(device.id); }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wider transition-colors duration-200 bg-slate-100 text-slate-600`}
                >
                  Detalle
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