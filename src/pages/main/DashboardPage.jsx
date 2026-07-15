import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Waves, Plus, Loader2, Droplet, Sun, Lightbulb } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { BottomNav } from '../components/layout/BottomNav';
import { getUserDevices, togglePumpState, toggleLampState } from '../services/deviceService';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDevices = async () => {
    setIsLoading(true);
    const { ok, data } = await getUserDevices();
    if (ok && data.status === 'success') {
      const mappedDevices = data.data.map((device) => ({
        id: device.id,
        name: device.name,
        is_online: device.is_online,
        state: device.current_state || device.state || 'STANDBY',
        capabilities: device.capabilities || {},
        last_humidity: device.last_humidity,
        last_luminosity: device.last_luminosity,
        settings: device.settings || {},
      }));
      setDevices(mappedDevices);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleTogglePump = async (e, deviceId, currentState) => {
    e.stopPropagation();
    const nextState = currentState === 'ON' ? 'OFF' : 'ON';
    const { ok } = await togglePumpState(deviceId, nextState);
    if (ok) {
      setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, state: nextState } : d));
    } else {
      alert('Error al cambiar el estado de la bomba');
    }
  };

  const handleToggleLamp = async (e, deviceId, currentLampState) => {
    e.stopPropagation();
    const nextState = currentLampState === 'ON' ? 'OFF' : 'ON';
    const { ok } = await toggleLampState(deviceId, nextState);
    if (ok) {
      setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, settings: { ...d.settings, lamp_state: nextState } } : d));
    } else {
      alert('Error al cambiar el estado del foco');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-800">
      <div className="max-w-md mx-auto px-6 pt-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Mis Macetas</h1>
            <p className="text-sm text-slate-500 font-medium">Monitoreo IoT en tiempo real</p>
          </div>
          <button 
            onClick={() => navigate('/devices/link')}
            className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
          >
            <Plus size={20} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 className="animate-spin mb-2 text-emerald-500" size={32} />
            <p className="text-sm font-medium">Cargando dispositivos...</p>
          </div>
        ) : devices.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-100">
            <p className="text-slate-400 font-medium mb-4">No tienes dispositivos vinculados.</p>
            <button onClick={() => navigate('/devices/link')} className="px-5 py-2.5 bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-sm">
              Vincular Primer Dispositivo
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {devices.map((device) => (
              <Card 
                key={device.id} 
                onClick={() => navigate(`/devices/${device.id}`)}
                className="p-5 bg-white border border-slate-100 shadow-sm rounded-2xl cursor-pointer hover:border-slate-200 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{device.name}</h3>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 mt-1 rounded-full tracking-wider ${device.is_online ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {device.is_online ? 'EN LÍNEA' : 'DESCONECTADO'}
                    </span>
                  </div>
                </div>

                {/* SECCIÓN DE SENSORES: APILADOS VERTICALMENTE CON ESTILO LIMPIO */}
                <div className="flex flex-col gap-2.5 mb-5">
                  {device.capabilities?.has_humidity && (
                    <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100/40">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shadow-sm">
                          <Droplet size={16} />
                        </div>
                        <span className="text-xs font-semibold text-slate-500">Humedad Suelo</span>
                      </div>
                      <span className="text-base font-black text-blue-600">
                        {device.last_humidity != null ? `${device.last_humidity}%` : '--'}
                      </span>
                    </div>
                  )}

                  {device.capabilities?.has_luminosity && (
                    <div className="flex items-center justify-between p-3 bg-amber-50/50 rounded-xl border border-amber-100/40">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-sm">
                          <Sun size={16} />
                        </div>
                        <span className="text-xs font-semibold text-slate-500">Luminosidad</span>
                      </div>
                      <span className="text-base font-black text-amber-600">
                        {device.last_luminosity != null ? `${device.last_luminosity} lx` : '--'}
                      </span>
                    </div>
                  )}
                </div>

                {/* BOTONES DE CONTROL DE ACTUADORES INDEPENDIENTES */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-50">
                  {device.capabilities?.has_pump && (
                    <button
                      type="button"
                      onClick={(e) => handleTogglePump(e, device.id, device.state)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-sm ${
                        device.state === 'ON' 
                          ? 'bg-blue-600 text-white font-black shadow-blue-200' 
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                      <Waves size={14} className={device.state === 'ON' ? 'animate-pulse' : ''} />
                      Bomba: {device.state}
                    </button>
                  )}

                  {device.capabilities?.has_lamp && (
                    <button
                      type="button"
                      onClick={(e) => handleToggleLamp(e, device.id, device.settings?.lamp_state)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-sm ${
                        device.settings?.lamp_state === 'ON' 
                          ? 'bg-amber-500 text-white font-black shadow-amber-200' 
                          : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                      }`}
                    >
                      <Lightbulb size={14} />
                      Foco: {device.settings?.lamp_state || 'OFF'}
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};