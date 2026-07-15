import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Droplet, Sun, Lightbulb, Loader2, RefreshCw } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { 
  getDeviceDetails,      
  togglePumpState,       
  toggleLampState,       
  updateWaterSettings,   
  updateLightSettings,   
  getDeviceSensorHistory,
  getDeviceRealTimeData // Llamamos a nuestro nuevo endpoint
} from '../../services/deviceService';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const DeviceDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Estados generales del dispositivo
  const [isLoading, setIsLoading] = useState(true);
  const [device, setDevice] = useState(null);

  // Estados dinámicos para los valores en tiempo real más recientes de la API
  const [realTimeHumidity, setRealTimeHumidity] = useState(null);
  const [realTimeLuminosity, setRealTimeLuminosity] = useState(null);

  // Estados independientes para las dos gráficas de historial
  const [humidityChartData, setHumidityChartData] = useState([]);
  const [lightChartData, setLightChartData] = useState([]);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState('24h');

  // Estados locales para Riego Inteligente
  const [autoWater, setAutoWater] = useState(false);
  const [humidityThreshold, setHumidityThreshold] = useState(40);
  const [isSavingWater, setIsSavingWater] = useState(false);

  // Estados locales para Iluminación Inteligente
  const [autoLight, setAutoLight] = useState(false);
  const [lightThreshold, setLightThreshold] = useState(300);
  const [isSavingLight, setIsSavingLight] = useState(false);

  /**
   * 1. MÉTODO DE CARGA Y ACTUALIZACIÓN SÍNCRONA
   * Obtiene detalles físicos, lecturas actuales en tiempo real e historial a la vez.
   */
  const refreshAllDeviceData = async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);

    try {
      // A. Cargar información del dispositivo (estado físico, configuraciones guardadas)
      const resDetails = await getDeviceDetails(id);
      let targetDevice = null;
      
      if (resDetails.ok && resDetails.data?.status === 'success') {
        targetDevice = resDetails.data.data;
        setDevice(targetDevice);

        // Solo inicializamos los thresholds en la carga inicial para no sobreescribir 
        // lo que el usuario está deslizando manualmente en ese instante.
        if (!isSilent && targetDevice.settings) {
          setAutoWater(targetDevice.settings.auto_water === 'true' || targetDevice.settings.auto_water === true);
          setHumidityThreshold(Number(targetDevice.settings.humidity_threshold || 40));
          
          setAutoLight(targetDevice.settings.auto_light === 'true' || targetDevice.settings.auto_light === true);
          setLightThreshold(Number(targetDevice.settings.light_threshold || 300));
        }
      }

      // B. Obtener las mediciones en tiempo real del endpoint sensor-data
      const resRealTime = await getDeviceRealTimeData(id);
      if (resRealTime.ok && resRealTime.data?.data) {
        const readings = resRealTime.data.data;

        // Buscamos la última lectura de Humedad en la lista
        const latestHumidityNode = readings.find(item => 
          item.sensor_type_id === 1 || 
          item.sensor_type?.name?.toLowerCase().includes('humedad') || 
          item.sensor_type?.unit === '%'
        );
        if (latestHumidityNode) {
          setRealTimeHumidity(latestHumidityNode.reading_value);
        }

        // Buscamos la última lectura de Luminosidad en la lista
        const latestLightNode = readings.find(item => 
          item.sensor_type_id === 2 || 
          item.sensor_type?.name?.toLowerCase().includes('luminosidad') || 
          item.sensor_type?.unit?.toLowerCase().includes('lx') ||
          item.sensor_type?.unit?.toLowerCase().includes('lux')
        );
        if (latestLightNode) {
          setRealTimeLuminosity(latestLightNode.reading_value);
        }
      }

      // C. Cargar las gráficas correspondientes
      if (targetDevice) {
        await fetchHistoryData(targetDevice, timeFilter);
      }

    } catch (error) {
      console.error("Error cargando el panel del dispositivo:", error);
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  };

  /**
   * 2. CARGAR EL HISTORIAL DE LAS DOS GRÁFICAS POR SEPARADO
   */
  const fetchHistoryData = async (targetDevice, filter) => {
    const hasHumidity = targetDevice.capabilities?.has_humidity ?? false;
    const hasLuminosity = targetDevice.capabilities?.has_luminosity ?? false;

    try {
      const promises = [];

      if (hasHumidity) {
        promises.push(
          getDeviceSensorHistory(id, 'humedad_suelo', filter).then(res => {
            if (res.ok && res.data?.status === 'success') {
              return {
                type: 'humidity',
                data: res.data.data.map(item => ({
                  timestamp: item.label,
                  value: Number(item.value || 0)
                }))
              };
            }
            return { type: 'humidity', data: [] };
          })
        );
      }

      if (hasLuminosity) {
        promises.push(
          getDeviceSensorHistory(id, 'luminosidad', filter).then(res => {
            if (res.ok && res.data?.status === 'success') {
              return {
                type: 'luminosity',
                data: res.data.data.map(item => ({
                  timestamp: item.label,
                  value: Number(item.value || 0)
                }))
              };
            }
            return { type: 'luminosity', data: [] };
          })
        );
      }

      const results = await Promise.all(promises);

      results.forEach(result => {
        if (result.type === 'humidity') {
          setHumidityChartData(result.data);
        } else if (result.type === 'luminosity') {
          setLightChartData(result.data);
        }
      });

    } catch (error) {
      console.error("Error cargando historial de gráficas:", error);
    }
  };

  /**
   * 3. INICIALIZADOR Y BUCLE DE TIEMPO REAL (POLLING CADA 10 SEGUNDOS)
   */
  useEffect(() => {
    // Primer carga con loader en pantalla
    refreshAllDeviceData(false);

    // Bucle para recargar silenciosamente en segundo plano
    const intervalId = setInterval(() => {
      refreshAllDeviceData(true);
    }, 10000); // 10000ms = 10 segundos

    return () => clearInterval(intervalId);
  }, [id]);

  // Si el usuario cambia el filtro temporal, actualizamos el historial inmediatamente
  useEffect(() => {
    if (device) {
      setIsChartLoading(true);
      fetchHistoryData(device, timeFilter).finally(() => setIsChartLoading(false));
    }
  }, [timeFilter]);

  // Manejadores de control manual rápidos
  const handleManualPump = async () => {
    if (!device) return;
    const nextState = device.current_state === 'ON' ? 'STANDBY' : 'ON';
    setDevice(prev => ({ ...prev, current_state: nextState }));
    
    const res = await togglePumpState(id, nextState);
    if (!res.ok) {
      alert('Error al cambiar el estado de la bomba');
    }
    refreshAllDeviceData(true);
  };

  const handleManualLamp = async () => {
    if (!device) return;
    const currentLamp = device.settings?.lamp_state || 'OFF';
    const nextLamp = currentLamp === 'ON' ? 'OFF' : 'ON';
    
    setDevice(prev => ({
      ...prev,
      settings: { ...prev.settings, lamp_state: nextLamp }
    }));

    const res = await toggleLampState(id, nextLamp);
    if (!res.ok) {
      alert('Error al cambiar el estado del foco');
    }
    refreshAllDeviceData(true);
  };

  // Guardado de bloques de configuración
  const handleSaveWaterSettings = async () => {
    setIsSavingWater(true);
    const res = await updateWaterSettings(id, {
      auto_water: autoWater,
      humidity_threshold: humidityThreshold
    });
    setIsSavingWater(false);
    alert(res.ok ? 'Ajustes de riego guardados correctamente' : 'Error al guardar riego');
  };

  const handleSaveLightSettings = async () => {
    setIsSavingLight(true);
    const res = await updateLightSettings(id, {
      auto_light: autoLight,
      light_threshold: lightThreshold
    });
    setIsSavingLight(false);
    alert(res.ok ? 'Ajustes de iluminación guardados correctamente' : 'Error al guardar iluminación');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Sincronizando sensores en tiempo real...</p>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
        <p className="text-slate-600 font-semibold mb-4">No se pudo cargar el dispositivo.</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold">
          Volver
        </button>
      </div>
    );
  }

  const hasPump = device.capabilities?.has_pump ?? false;
  const hasHumidity = device.capabilities?.has_humidity ?? false;
  const hasLuminosity = device.capabilities?.has_luminosity ?? false;
  const hasLamp = device.capabilities?.has_lamp ?? false;

  const activeMetricsCount = (hasHumidity ? 1 : 0) + (hasLuminosity ? 1 : 0);
  const gridColumnsClass = activeMetricsCount > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1';

  // Mostrar el valor traído en tiempo real de la API si existe, de lo contrario el respaldado
  const displayHumidity = realTimeHumidity !== null 
    ? `${realTimeHumidity}%` 
    : (device.last_humidity !== undefined && device.last_humidity !== null ? `${device.last_humidity}%` : '--%');

  const displayLight = realTimeLuminosity !== null 
    ? `${realTimeLuminosity} lx` 
    : (device.last_luminosity !== undefined && device.last_luminosity !== null ? `${device.last_luminosity} lx` : '-- lx');

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-black text-slate-800 leading-tight">{device.name}</h1>
              <p className="text-xs font-semibold text-slate-400">
                Bomba Física: <span className="text-slate-600 uppercase font-bold">{device.current_state || 'STANDBY'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="animate-pulse w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className={`px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase ${
              device.is_online ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50' : 'bg-slate-100 text-slate-500'
            }`}>
              {device.is_online ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      {/* CUERPO DEL PANEL */}
      <div className="max-w-4xl mx-auto px-6 pt-6 space-y-6">
        
        {/* ========================================================= */}
        {/* 1. TARJETAS DE LECTURA DE SENSORES EN TIEMPO REAL        */}
        {/* ========================================================= */}
        <div className={`grid ${gridColumnsClass} gap-4`}>
          {hasHumidity && (
            <Card className="p-5 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg shadow-blue-500/10">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
                  <Droplet className="w-6 h-6 text-white" />
                </div>
                <span className="text-[11px] font-black tracking-widest uppercase bg-white/20 px-2.5 py-1 rounded-lg">
                  Suelo
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-blue-100 uppercase tracking-wider block">Humedad en Vivo</span>
                <div className="text-4xl font-black tracking-tight">{displayHumidity}</div>
                <p className="text-xs text-blue-100/80 font-medium pt-1">Actualizado hace unos segundos</p>
              </div>
            </Card>
          )}

          {hasLuminosity && (
            <Card className="p-5 bg-gradient-to-br from-amber-500 to-amber-600 text-white border-none shadow-lg shadow-amber-500/10">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
                  <Sun className="w-6 h-6 text-white" />
                </div>
                <span className="text-[11px] font-black tracking-widest uppercase bg-white/20 px-2.5 py-1 rounded-lg">
                  Luz Ambiente
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-100 uppercase tracking-wider block">Intensidad en Vivo</span>
                <div className="text-4xl font-black tracking-tight">{displayLight}</div>
                <p className="text-xs text-amber-100/80 font-medium pt-1">Actualizado en tiempo real</p>
              </div>
            </Card>
          )}
        </div>

        {/* ========================================================= */}
        {/* 2. FILTRADO DE TIEMPO PARA HISTÓRICOS                     */}
        {/* ========================================================= */}
        {(hasHumidity || hasLuminosity) && (
          <div className="flex justify-end bg-white p-2 rounded-2xl border border-slate-100 shadow-sm max-w-xs ml-auto">
            <span className="text-xs text-slate-400 font-bold self-center mr-3 pl-2">Periodo:</span>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {['24h', '7d', '30d'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    timeFilter === filter ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {filter === '24h' ? 'Día' : filter === '7d' ? 'Semana' : 'Mes'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. HISTORIAL DE HUMEDAD                                  */}
        {/* ========================================================= */}
        {hasHumidity && (
          <Card className="p-6 bg-white border border-slate-100/80 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Droplet className="w-5 h-5 text-blue-500" />
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Historial de Humedad (%)</h2>
            </div>

            <div className="h-[230px] w-full">
              {isChartLoading ? (
                <div className="w-full h-full flex flex-col justify-center items-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mb-2" />
                  <span className="text-xs font-semibold">Cargando mediciones...</span>
                </div>
              ) : humidityChartData.length === 0 ? (
                <div className="w-full h-full flex justify-center items-center text-slate-400 text-xs font-semibold">
                  Sin lecturas para graficar en este periodo.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={humidityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="timestamp" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="value" name="Humedad" stroke="#3B82F6" strokeWidth={2.5} fill="url(#colorHum)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        )}

        {/* ========================================================= */}
        {/* 4. HISTORIAL DE LUMINOSIDAD                              */}
        {/* ========================================================= */}
        {hasLuminosity && (
          <Card className="p-6 bg-white border border-slate-100/80 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Sun className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Historial de Luminosidad (lx)</h2>
            </div>

            <div className="h-[230px] w-full">
              {isChartLoading ? (
                <div className="w-full h-full flex flex-col justify-center items-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mb-2" />
                  <span className="text-xs font-semibold">Cargando mediciones...</span>
                </div>
              ) : lightChartData.length === 0 ? (
                <div className="w-full h-full flex justify-center items-center text-slate-400 text-xs font-semibold">
                  Sin lecturas para graficar en este periodo.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={lightChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorLuz" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="timestamp" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="value" name="Luminosidad" stroke="#F59E0B" strokeWidth={2.5} fill="url(#colorLuz)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        )}

        {/* ========================================================= */}
        {/* 5. SECCIÓN DE RIEGO INTELIGENTE                           */}
        {/* ========================================================= */}
        {hasPump && (
          <Card className="p-6 bg-white border border-slate-100/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Droplet className="w-5 h-5 text-blue-500" />
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Riego Inteligente</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Modo automático y control de umbral</p>
                </div>
              </div>
              
              <button
                onClick={() => setAutoWater(!autoWater)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  autoWater ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  autoWater ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">Regar cuando la humedad sea menor a:</span>
                <span className="text-blue-600 font-black">{humidityThreshold}%</span>
              </div>
              <input 
                type="range" min="10" max="90" step="5"
                value={humidityThreshold} 
                onChange={(e) => setHumidityThreshold(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
                disabled={!autoWater}
              />
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-50">
              <span className="text-xs font-bold text-slate-600">Control Manual de Bomba</span>
              <button 
                onClick={handleManualPump} 
                className={`px-4 py-2 rounded-xl text-xs font-black shadow-sm tracking-wide transition-colors ${
                  device.current_state === 'ON' ? 'bg-rose-500 text-white' : 'bg-blue-50 text-blue-600'
                }`}
              >
                {device.current_state === 'ON' ? 'DETENER BOMBA' : 'REGAR AHORA'}
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={handleSaveWaterSettings} 
                disabled={isSavingWater}
                className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {isSavingWater ? 'Guardando...' : 'Guardar Riego'}
              </button>
            </div>
          </Card>
        )}

        {/* ========================================================= */}
        {/* 6. SECCIÓN DE ILUMINACIÓN INTELIGENTE                     */}
        {/* ========================================================= */}
        {hasLamp && (
          <Card className="p-6 bg-white border border-slate-100/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Iluminación Inteligente</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Encendido automático según luz ambiente</p>
                </div>
              </div>

              <button
                onClick={() => setAutoLight(!autoLight)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  autoLight ? 'bg-amber-500' : 'bg-slate-200'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  autoLight ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">Encender foco cuando la luz baje de:</span>
                <span className="text-amber-600 font-black">{lightThreshold} lx</span>
              </div>
              <input 
                type="range" min="50" max="1000" step="25"
                value={lightThreshold} 
                onChange={(e) => setLightThreshold(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
                disabled={!autoLight}
              />
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-50">
              <span className="text-xs font-bold text-slate-600">Control Manual del Foco</span>
              <button 
                onClick={handleManualLamp} 
                className={`px-4 py-2 rounded-xl text-xs font-black shadow-sm tracking-wide transition-colors ${
                  device.settings?.lamp_state === 'ON' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600'
                }`}
              >
                {device.settings?.lamp_state === 'ON' ? 'APAGAR FOCO' : 'ENCENDER FOCO'}
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={handleSaveLightSettings}
                disabled={isSavingLight} 
                className="px-5 py-2.5 bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {isSavingLight ? 'Guardando...' : 'Guardar Iluminación'}
              </button>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
};