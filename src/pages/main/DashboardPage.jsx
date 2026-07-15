import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Waves, Plus, Loader2, Droplet, Sun, Lightbulb } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { BottomNav } from '../../components/layout/BottomNav';
import { getUserDevices, togglePumpState, toggleLampState } from '../../services/deviceService';

export const DashboardPage = () => {
  const navigate = useNavigate();

  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Obtener y estructurar los datos del Backend
  const fetchDevices = async () => {
    setIsLoading(true);
    const { ok, data } = await getUserDevices();

    if (ok && data.status === 'success') {
      const mappedDevices = data.data.map((device) => {
        const capabilities = device.capabilities || {};
        
        return {
          id: device.id,
          name: device.name,
          is_online: device.is_online,
          current_state: device.current_state || 'STANDBY',
          last_humidity: device.last_humidity,
          last_luminosity: device.last_luminosity,
          capabilities: {
            has_pump: !!capabilities.has_pump,
            has_humidity: !!capabilities.has_humidity,
            has_light_sensor: !!capabilities.has_light_sensor,
          },
          lamp_state: device.settings?.lamp_state || 'OFF',
        };
      });

      setDevices(mappedDevices);
    } else {
      console.error("Error al cargar dispositivos:", data?.message);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  // 2. Alternar estado de la Bomba de Agua
  const handleTogglePump = async (e, id, currentState) => {
    e.stopPropagation();
    const nextState = currentState === 'ON' ? 'STANDBY' : 'ON';

    setDevices(prev => prev.map(d => d.id === id ? { ...d, current_state: nextState } : d));

    const { ok } = await togglePumpState(id, nextState);
    if (!ok) {
      alert("Error al cambiar el estado de la bomba.");
      fetchDevices();
    }
  };

  // 3. Alternar estado del Foco / Lámpara
  const handleToggleLamp = async (e, id, currentLampState) => {
    e.stopPropagation();
    const nextState = currentLampState === 'ON' ? 'OFF' : 'ON';

    setDevices(prev => prev.map(d => d.id === id ? { ...d, lamp_state: nextState } : d));

    const { ok } = await toggleLampState(id, nextState);
    if (!ok) {
      alert("Error al cambiar el estado del foco.");
      fetchDevices();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FA] relative">
      
      {/* cabecera superior */}
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

      {/* Listado de Tarjetas */}
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
          <Card 
            key={device.id} 
            className="flex items-center justify-between p-4 py-4 shadow-sm border-0 bg-white rounded-2xl"
          >
            
            {/* SECCIÓN IZQUIERDA: Bloques de lectura de Sensores Activos */}
            <div 
              className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
              onClick={() => navigate(`/device/${device.id}`)}
            >
              <div className="flex items-center gap-2 flex-shrink-0">
                
                {/* Indicador Visual de Humedad del Suelo */}
                {device.capabilities.has_humidity && (
                  <div className="w-14 h-14 rounded-2xl bg-[#F4F6F8] flex flex-col items-center justify-center flex-shrink-0">
                    <Droplet className="text-primary mb-0.5" size={15} strokeWidth={2.5} />
                    <span className="text-[#1F2937] font-bold text-[13px]">
                      {device.last_humidity !== null && device.last_humidity !== undefined ? `${device.last_humidity}%` : '--'}
                    </span>
                  </div>
                )}

                {/* Indicador Visual de Luminosidad / Sensor de Luz */}
                {device.capabilities.has_light_sensor && (
                  <div className="w-14 h-14 rounded-2xl bg-[#F4F6F8] flex flex-col items-center justify-center flex-shrink-0">
                    <Sun className="text-amber-500 mb-0.5" size={16} strokeWidth={2.5} />
                    <span className="text-[#1F2937] font-bold text-[12px] tracking-tighter">
                      {device.last_luminosity !== null && device.last_luminosity !== undefined ? `${device.last_luminosity}lx` : '--'}
                    </span>
                  </div>
                )}

                {/* Fallback general por si no cuenta con ningún sensor mapeado */}
                {!device.capabilities.has_humidity && !device.capabilities.has_light_sensor && (
                  <div className="w-14 h-14 rounded-2xl bg-[#F4F6F8] flex items-center justify-center flex-shrink-0">
                    <Waves className="text-primary" size={22} strokeWidth={2.5} />
                  </div>
                )}
              </div>
              
              {/* SECCIÓN CENTRAL: Nombre del Dispositivo y Subtítulo de Red */}
              <div className="flex flex-col min-w-0 truncate pr-1">
                <span className="text-[#1F2937] font-semibold text-[15px] leading-tight truncate">
                  {device.name}
                </span>
                <span className="text-slate-400 text-[12px] mt-1 font-medium flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${device.is_online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  {device.is_online ? device.current_state : 'DESCONECTADO'}
                </span>
              </div>
            </div>

            {/* SECCIÓN DERECHA: Botones de Actuadores Guiados por Iconografía Uniforme */}
            <div className="flex flex-col gap-2 pl-2 flex-shrink-0 justify-center">
              
              {/* Botón Control del Agua (Bomba) */}
              {device.capabilities.has_pump && (
                <button 
                  type="button"
                  onClick={(e) => handleTogglePump(e, device.id, device.current_state)}
                  className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-[11px] font-black tracking-wider transition-all duration-200 min-w-[78px] ${
                    device.current_state === 'ON' 
                      ? 'bg-[#E6F8F5] text-primary shadow-sm shadow-[#e6f8f5]/40' 
                      : 'bg-[#F4F6F8] text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  <Waves size={14} strokeWidth={2.5} className={device.current_state === 'ON' ? 'animate-pulse' : ''} />
                  <span>{device.current_state === 'ON' ? 'ON' : 'OFF'}</span>
                </button>
              )}

              {/* Botón Control de la Luz (Foco) */}
              {device.capabilities.has_light_sensor && (
                <button 
                  type="button"
                  onClick={(e) => handleToggleLamp(e, device.id, device.lamp_state)}
                  className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-[11px] font-black tracking-wider transition-all duration-200 min-w-[78px] ${
                    device.lamp_state === 'ON' 
                      ? 'bg-[#E6F8F5] text-primary shadow-sm shadow-[#e6f8f5]/40' 
                      : 'bg-[#F4F6F8] text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  <Lightbulb size={14} strokeWidth={2.5} />
                  <span>{device.lamp_state === 'ON' ? 'ON' : 'OFF'}</span>
                </button>
              )}
            </div>

          </Card>
        ))}
      </div>

      {/* Navegación Inferior */}
      <BottomNav />

    </div>
  );
};