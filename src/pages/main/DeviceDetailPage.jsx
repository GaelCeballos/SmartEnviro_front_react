import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Droplet, Waves, Loader2, Sun, Lightbulb, Activity } from 'lucide-react';
import { Card } from '../components/ui/Card'; 
import { 
  getDeviceDetails,      
  togglePumpState,       
  toggleLampState,       
  updateWaterSettings,   
  updateLightSettings,   
  getDeviceSensorHistory 
} from '../services/deviceService';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const DeviceDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [device, setDevice] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [timeFilter, setTimeFilter] = useState('24h');

  // Estados locales independientes para Riego
  const [autoWater, setAutoWater] = useState(false);
  const [humidityThreshold, setHumidityThreshold] = useState(40);

  // Estados locales independientes para Iluminación
  const [autoLight, setAutoLight] = useState(false);
  const [lightThreshold, setLightThreshold] = useState(300);

  const loadDeviceData = async () => {
    setIsLoading(true);
    const { ok, data } = await getDeviceDetails(id);
    if (ok && data.status === 'success') {
      const dev = data.data;
      setDevice(dev);
      setAutoWater(dev.settings?.auto_water || false);
      setHumidityThreshold(dev.settings?.humidity_threshold || 43);
      setAutoLight(dev.settings?.auto_light || false);
      setLightThreshold(dev.settings?.light_threshold || 300);
      
      if (dev.history) {
        setChartData(dev.history);
      }
    } else {
      alert('Dispositivo no encontrado');
      navigate('/dashboard');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadDeviceData();
  }, [id]);

  const handleManualPump = async () => {
    const nextState = device.state === 'ON' ? 'OFF' : 'ON';
    const { ok } = await togglePumpState(id, nextState);
    if (ok) setDevice(prev => ({ ...prev, state: nextState }));
  };

  const handleManualLamp = async () => {
    const nextState = device.settings.lamp_state === 'ON' ? 'OFF' : 'ON';
    const { ok } = await toggleLampState(id, nextState);
    if (ok) setDevice(prev => ({ ...prev, settings: { ...prev.settings, lamp_state: nextState } }));
  };

  // GUARDADO EXCLUSIVO DE RIEGO
  const handleSaveWaterSettings = async () => {
    const { ok } = await updateWaterSettings(id, { auto_water: autoWater, humidity_threshold: humidityThreshold });
    if (ok) {
      alert('Configuración de riego guardada.');
    } else {
      alert('Error al guardar configuración de riego.');
    }
  };

  // GUARDADO EXCLUSIVO DE ILUMINACIÓN
  const handleSaveLightSettings = async () => {
    const { ok } = await updateLightSettings(id, { auto_light: autoLight, light_threshold: lightThreshold });
    if (ok) {
      alert('Configuración de iluminación guardada.');
    } else {
      alert('Error al guardar configuración de iluminación.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-emerald-500" size={36} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12 text-slate-800">
      <div className="max-w-md mx-auto px-6 pt-6">
        
        {/* Cabecera */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/dashboard')} className="p-2 bg-white border border-slate-100 rounded-xl shadow-sm text-slate-600">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-tight">{device.name}</h1>
            <p className="text-xs text-slate-400 font-bold">{device.is_online ? 'CONECTADO' : 'DESCONECTADO'}</p>
          </div>
        </div>

        {/* Gráfica Histórica */}
        <Card className="p-4 bg-white border border-slate-100 shadow-sm rounded-2xl mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-1.5 text-slate-800 font-bold text-sm">
              <Activity size={16} className="text-emerald-500" />
              Historial de Lecturas
            </div>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="recorded_at" tickFormatter={(str) => format(parseISO(str), 'HH:mm')} stroke="#94A3B8" fontSize={10} />
                <YAxis stroke="#94A3B8" fontSize={10} />
                <Tooltip labelFormatter={(str) => format(parseISO(str), 'dd LLL, HH:mm', { locale: es })} />
                <Area type="monotone" dataKey="reading_value" stroke="#10B981" fillOpacity={0.1} fill="#10B981" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* BLOQUE 1: CONFIGURACIÓN DE RIEGO (AGUA) */}
        {device.capabilities?.has_pump && (
          <Card className="p-5 bg-white border border-slate-100 shadow-sm rounded-2xl mb-6">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-3">
              <Droplet className="text-blue-500" size={20} />
              <h2 className="font-extrabold text-slate-900 text-sm">Sistema de Riego</h2>
            </div>

            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-600">Riego Automático</span>
              <button 
                onClick={() => setAutoWater(!autoWater)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${autoWater ? 'bg-blue-500' : 'bg-slate-200'}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${autoWater ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {autoWater && (
              <div className="mb-4">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
                  <span>Umbral de Humedad</span>
                  <span className="text-blue-600 font-black">{humidityThreshold}%</span>
                </div>
                <input 
                  type="range" min="10" max="90" 
                  value={humidityThreshold} 
                  onChange={(e) => setHumidityThreshold(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-slate-50 mt-2">
              <span className="text-xs font-bold text-slate-600">Encendido Forzado</span>
              <button 
                onClick={handleManualPump} 
                className={`px-3 py-1.5 rounded-xl text-xs font-black shadow-sm tracking-wide transition-colors ${
                  device.state === 'ON' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
                }`}
              >
                {device.state === 'ON' ? 'APAGAR' : 'ENCENDER'}
              </button>
            </div>

            <div className="mt-4 flex justify-end">
              <button onClick={handleSaveWaterSettings} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-100">
                Guardar Riego
              </button>
            </div>
          </Card>
        )}

        {/* BLOQUE 2: CONFIGURACIÓN DE ILUMINACIÓN (LUZ) */}
        {device.capabilities?.has_lamp && (
          <Card className="p-5 bg-white border border-slate-100 shadow-sm rounded-2xl">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-3">
              <Lightbulb className="text-amber-500" size={20} />
              <h2 className="font-extrabold text-slate-900 text-sm">Sistema de Iluminación</h2>
            </div>

            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-600">Luz Automática</span>
              <button 
                onClick={() => setAutoLight(!autoLight)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${autoLight ? 'bg-amber-500' : 'bg-slate-200'}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${autoLight ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {autoLight && (
              <div className="mb-4">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
                  <span>Umbral Lumínico mínimo</span>
                  <span className="text-amber-600 font-black">{lightThreshold} lx</span>
                </div>
                <input 
                  type="range" min="50" max="1000" step="25"
                  value={lightThreshold} 
                  onChange={(e) => setLightThreshold(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-slate-50 mt-2">
              <span className="text-xs font-bold text-slate-600">Interruptor Manual</span>
              <button 
                onClick={handleManualLamp} 
                className={`px-3 py-1.5 rounded-xl text-xs font-black shadow-sm tracking-wide transition-colors ${
                  device.settings?.lamp_state === 'ON' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600'
                }`}
              >
                {device.settings?.lamp_state === 'ON' ? 'APAGAR' : 'ENCENDER'}
              </button>
            </div>

            <div className="mt-4 flex justify-end">
              <button onClick={handleSaveLightSettings} className="px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-100">
                Guardar Iluminación
              </button>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
};