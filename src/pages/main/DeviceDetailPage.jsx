import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Droplet, Waves, Loader2, Cpu, Activity } from 'lucide-react';
import { Card } from '../../components/ui/Card'; 
import { 
  getDeviceDetails,       
  toggleDeviceState,      
  updateDeviceSettings,   
  getDeviceSensorData,     
  getDeviceSensorHistory   
} from '../../services/deviceService';

// Importaciones para la gráfica
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const DeviceDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Estados de carga y generales
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [latestMoisture, setLatestMoisture] = useState('--');
  
  // Estados para controlar la gráfica y sus filtros
  const [chartData, setChartData] = useState([]); 
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState('24h'); // '24h', '7d', '1m'

  const [device, setDevice] = useState({
    name: 'Cargando...',
    is_online: false,
    current_state: 'OFF',
    capabilities: { has_pump: false, has_humidity: false }
  });

  const [settings, setSettings] = useState({
    auto_water: false,
    humidity_threshold: 30
  });

  // =========================================================================
  // EFECTO 1: Detalles del dispositivo y Actualización de Valor Actual (Cada 5s)
  // =========================================================================
  useEffect(() => {
    const fetchCoreData = async () => {
      try {
        const devRes = await getDeviceDetails(id);
        if (devRes.ok && devRes.data?.data) {
          const devData = devRes.data.data;
          
          setDevice({
            name: devData.name,
            is_online: devData.is_online,
            // CORRECCIÓN AQUÍ: Tomamos 'state' directamente de tu JSON
            current_state: devData.state || 'OFF', 
            capabilities: devData.capabilities || { has_pump: true, has_humidity: true }
          });
          
          setSettings({
            auto_water: devData.settings?.auto_water || false,
            humidity_threshold: devData.settings?.humidity_threshold || 30
          });
        }
        
        // Carga el valor instantáneo de la tarjeta superior por primera vez
        const sensorRes = await getDeviceSensorData(id);
        if (sensorRes.ok && sensorRes.data?.data) {
          const readings = sensorRes.data.data;
          if (readings.length > 0) {
            setLatestMoisture(parseFloat(readings[0].reading_value).toFixed(1));
          }
        }
      } catch (error) {
        console.error("Error obteniendo datos base:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoreData();

    // Loop de tiempo real exclusivo para el porcentaje gigante superior
    const interval = setInterval(async () => {
      const sensorRes = await getDeviceSensorData(id);
      if (sensorRes.ok && sensorRes.data?.data) {
        const readings = sensorRes.data.data;
        if (readings.length > 0) {
          setLatestMoisture(parseFloat(readings[0].reading_value).toFixed(1));
        }
      }
      
      // Opcional: También actualizar el estado (ON/OFF) en tiempo real por si cambia externamente
      const devRes = await getDeviceDetails(id);
      if (devRes.ok && devRes.data?.data) {
        setDevice(prev => ({ ...prev, current_state: devRes.data.data.state || prev.current_state }));
      }

    }, 5000);

    return () => clearInterval(interval);
  }, [id]);


  // =========================================================================
  // EFECTO 2: Lógica inteligente para alimentar la Gráfica
  // =========================================================================
  useEffect(() => {
    const updateGraphData = async () => {
      setIsChartLoading(true);

      if (timeFilter === '24h') {
        const res = await getDeviceSensorData(id);
        
        if (res.ok && res.data?.data) {
          const rawReadings = [...res.data.data].reverse();

          const formatted = rawReadings.map(item => {
            let timeLabel = item.recorded_at;
            try {
              timeLabel = format(parseISO(item.recorded_at), 'HH:mm');
            } catch (e) {
              console.error(e);
            }
            return {
              time: timeLabel,
              humedad: parseFloat(item.reading_value)
            };
          });
          setChartData(formatted);
        } else {
          setChartData([]);
        }

      } else {
        let backendPeriod = timeFilter === '7d' ? 'week' : 'month';
        const res = await getDeviceSensorHistory(id, backendPeriod, 1);

        if (res.ok && res.data?.data) {
          const backendHistory = res.data.data;

          const formatted = backendHistory.map(item => {
            let readableTime = item.label;
            try {
              if (timeFilter === '7d') {
                readableTime = format(parseISO(item.label), 'dd MMM', { locale: es });
              } else if (timeFilter === '1m') {
                if (item.label.length === 6) {
                  readableTime = `Sem. ${item.label.substring(4)}`;
                }
              }
            } catch (e) {
              console.error(e);
            }
            return {
              time: readableTime,
              humedad: parseFloat(item.value)
            };
          });
          setChartData(formatted);
        } else {
          setChartData([]);
        }
      }

      setIsChartLoading(false);
    };

    if (device.capabilities?.has_humidity) {
      updateGraphData();
    }
  }, [id, timeFilter, device.capabilities?.has_humidity]);


  const handleToggleState = async () => {
    if (settings.auto_water) return;
    const newState = device.current_state === 'ON' ? 'OFF' : 'ON';
    setDevice(prev => ({ ...prev, current_state: newState }));

    const res = await toggleDeviceState(id, newState);
    if (!res.ok) {
      setDevice(prev => ({ ...prev, current_state: prev.current_state === 'ON' ? 'OFF' : 'ON' }));
      alert('Error al accionar la bomba');
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    const res = await updateDeviceSettings(id, settings);
    setIsSaving(false);
    if (!res.ok) {
      alert("Error al guardar la configuración");
    } else {
      alert("Configuración de riego guardada con éxito");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
        <p className="text-slate-500 font-medium animate-pulse">Sincronizando con tu dispositivo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans">
      {/* Header */}
      <div className="pt-12 pb-6 px-6 flex items-center gap-4 bg-white sticky top-0 z-20 shadow-sm">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 -ml-2 bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{device.name || 'Dispositivo'}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${device.is_online ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span className="text-sm font-medium text-slate-500">{device.is_online ? 'En línea' : 'Sin conexión'}</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 space-y-6">
        {/* Tarjeta Principal (Lectura en Tiempo Real) */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 font-medium mb-1">Humedad de suelo</p>
              <div className="flex items-baseline gap-1">
                <h2 className="text-5xl font-black tracking-tighter">{latestMoisture}</h2>
                <span className="text-xl text-slate-400 font-bold">%</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <Droplet size={24} className="text-sky-400" />
            </div>
          </div>

          <div className="mt-8">
            <p className="text-sm text-slate-400 mb-3 font-medium">Estado actual</p>
            <div className="flex items-center gap-3">
              {/* CORRECCIÓN AQUÍ: Etiqueta dinámica reflejando ON/OFF */}
              <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${device.current_state === 'ON' ? 'bg-sky-500/20 text-sky-400' : 'bg-white/10 text-slate-300'}`}>
                {device.current_state === 'ON' ? <Waves size={16} /> : <Cpu size={16} />}
                {device.current_state === 'ON' ? 'ON - Regando' : 'OFF - En reposo'}
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Análisis y Gráfica */}
        {device.capabilities?.has_humidity && (
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 px-1 flex items-center gap-2">
              <Activity size={20} className="text-primary" />
              Análisis de Humedad
            </h3>
            
            <Card className="p-5">
              <div className="flex gap-2 mb-6">
                {[
                  { id: '24h', label: 'Hoy' },
                  { id: '7d', label: 'Semana' },
                  { id: '1m', label: 'Mes' }
                ].map((filter) => (
                  <button 
                    key={filter.id}
                    onClick={() => setTimeFilter(filter.id)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                      ${timeFilter === filter.id 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                    `}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Contenedor de la Gráfica con Spinner de Carga Independiente */}
              {isChartLoading ? (
                <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-sm bg-slate-50/50 rounded-xl">
                  <Loader2 className="animate-spin text-primary mb-2" size={24} />
                  Sincronizando lecturas...
                </div>
              ) : chartData.length > 0 ? (
                <div className="h-48 w-full -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorHumedad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[0, 100]} dx={-10} />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#0EA5E9', fontWeight: 'bold' }}
                        labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
                        formatter={(value) => [`${value}%`, 'Humedad']}
                      />
                      <Area type="monotone" dataKey="humedad" stroke="#0EA5E9" strokeWidth={3} fill="url(#colorHumedad)" activeDot={{ r: 5, strokeWidth: 0, fill: '#0EA5E9' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Sin lecturas registradas para este periodo.
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Automatización y Control Manual */}
        {device.capabilities?.has_pump && (
          <Card className="p-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Riego Inteligente</h3>
                <p className="text-sm text-slate-500 mt-1">Automatiza según la humedad</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.auto_water} onChange={(e) => setSettings({...settings, auto_water: e.target.checked})} />
                <div className="w-14 h-7 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary shadow-inner"></div>
              </label>
            </div>

            {settings.auto_water ? (
              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">Regar cuando baje de:</span>
                  <span className="text-sm font-bold text-primary">{settings.humidity_threshold}%</span>
                </div>
                <input type="range" min="0" max="100" value={settings.humidity_threshold} onChange={(e) => setSettings({...settings, humidity_threshold: parseInt(e.target.value)})} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
              </div>
            ) : (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Control Manual</span>
                <button onClick={handleToggleState} className={`w-[50px] h-[28px] flex items-center rounded-full p-1 transition-colors duration-300 ${device.current_state === 'ON' ? 'bg-primary' : 'bg-slate-300'}`}>
                  <div className={`bg-white w-[20px] h-[20px] rounded-full shadow-sm transform transition-transform duration-300 ${device.current_state === 'ON' ? 'translate-x-[22px]' : 'translate-x-0'}`} />
                </button>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Botón Flotante para Guardar Ajustes */}
      {device.capabilities?.has_pump && (
        <div className="sticky bottom-6 left-0 right-0 w-full max-w-md mx-auto px-6 z-[99] mt-8 pb-2">
          <button onClick={handleSaveSettings} disabled={isSaving} className="w-full bg-slate-900 text-white font-semibold text-[16px] py-4 rounded-2xl shadow-2xl active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:bg-slate-400">
            {isSaving && <Loader2 className="animate-spin" size={20} />}
            {isSaving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      )}
    </div>
  );
};