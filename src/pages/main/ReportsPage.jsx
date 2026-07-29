import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { BottomNav } from '../../components/layout/BottomNav'; 
import { getUserDevices, getDeviceSensorHistory } from '../../services/deviceService';
import { Loader2, Droplet, Activity, Cpu, Waves, Sun, Lightbulb } from 'lucide-react';

export const ReportsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState({
    avgHumidity: 0,
    avgLuminosity: 0,
    totalDevices: 0,
    onlineDevices: 0,
    wateringDevices: 0,
    activeLights: 0,
    hasLightDevices: false,
    healthStatus: 'Calculando...',
    healthColor: 'text-slate-400'
  });

  useEffect(() => {
    const fetchGlobalReports = async () => {
      setIsLoading(true);
      try {
        // Obtener la lista de todos los dispositivos del usuario desde producción
        const devRes = await getUserDevices();
        
        if (devRes.ok && devRes.data) {
          const devices = Array.isArray(devRes.data) ? devRes.data : (devRes.data.data || []);
          
          const total = devices.length;
          const online = devices.filter(d => d.is_online).length;
          const watering = devices.filter(d => 
            d.current_state === 'ON' || 
            d.current_state === 'WATERING' || 
            d.is_watering === true
          ).length;

          // Detectar si existe algún dispositivo con capacidades de iluminación o sensor de luz
          const hasLight = devices.some(d => 
            d.capabilities?.has_luminosity === true || 
            d.capabilities?.has_lamp === true
          );

          // Contar focos encendidos actualmente
          const activeLights = devices.filter(d => 
            d.lamp_state === 'ON' ||
            d.current_lamp_state === 'ON' ||
            d.settings?.lamp_state === 'ON'
          ).length;

          let totalHumiditySum = 0;
          let totalHumidityCount = 0;
          let totalLuminositySum = 0;
          let totalLuminosityCount = 0;

          const historyPromises = [];

          // Procesar lecturas y generar peticiones si se requieren
          devices.forEach(d => {
            const capabilities = d.capabilities || {};

            //Si el dispositivo ya incluye un historial en el JSON de '/api/my-devices'
            if (Array.isArray(d.history) && d.history.length > 0) {
              d.history.forEach(reading => {
                const val = parseFloat(reading.reading_value ?? reading.value);
                if (isNaN(val)) return;

                const metric = reading.sensor_type?.metric_key;

                if (capabilities.has_humidity && metric === 'humedad_suelo') {
                  totalHumiditySum += val;
                  totalHumidityCount++;
                }
                if (capabilities.has_luminosity && metric === 'luminosidad') {
                  totalLuminositySum += val;
                  totalLuminosityCount++;
                }
              });
            } 
            // Caso B: Consultar por endpoint individual usando la firma del servicio en producción
            // getDeviceSensorHistory(deviceId, sensorTypeKey, filter) -> period="week" ('7d')
            else {
              if (capabilities.has_humidity) {
                historyPromises.push(
                  getDeviceSensorHistory(d.id, 'humedad_suelo', '7d')
                    .then(res => ({ type: 'humidity', res }))
                    .catch(() => null)
                );
              }
              if (capabilities.has_luminosity) {
                historyPromises.push(
                  getDeviceSensorHistory(d.id, 'luminosidad', '7d')
                    .then(res => ({ type: 'luminosity', res }))
                    .catch(() => null)
                );
              }
            }
          });

          // 3. Resolver llamadas concurrentes al endpoint de historial
          if (historyPromises.length > 0) {
            const historiesRes = await Promise.all(historyPromises);
            historiesRes.forEach(item => {
              if (!item?.res?.ok) return;
              const readings = item.res.data?.data || item.res.data || [];
              if (Array.isArray(readings)) {
                readings.forEach(reading => {
                  const val = parseFloat(reading.reading_value ?? reading.value);
                  if (!isNaN(val)) {
                    if (item.type === 'humidity') {
                      totalHumiditySum += val;
                      totalHumidityCount++;
                    } else if (item.type === 'luminosity') {
                      totalLuminositySum += val;
                      totalLuminosityCount++;
                    }
                  }
                });
              }
            });
          }

          // 4. Calcular promedios generales
          const avgHum = totalHumidityCount > 0 ? (totalHumiditySum / totalHumidityCount) : 0;
          const avgLum = totalLuminosityCount > 0 ? (totalLuminositySum / totalLuminosityCount) : 0;

          // 5. Asignar leyenda acorde al porcentaje del estado de la humedad
          let health = 'Óptimo: Humedad Ideal';
          let healthColor = 'text-emerald-500';

          if (total === 0) {
            health = 'Sin dispositivos';
            healthColor = 'text-slate-400';
          } else if (avgHum === 0 && totalHumidityCount === 0) {
            health = 'Sin datos de lectura';
            healthColor = 'text-slate-400';
          } else if (avgHum < 30) {
            health = 'Crítico: Suelo Muy Seco';
            healthColor = 'text-rose-500';
          } else if (avgHum >= 30 && avgHum <= 60) {
            health = 'Óptimo: Humedad Ideal';
            healthColor = 'text-emerald-500';
          } else if (avgHum > 60 && avgHum <= 80) {
            health = 'Bueno: Humedad Alta';
            healthColor = 'text-sky-500';
          } else if (avgHum > 80) {
            health = 'Atención: Exceso de Humedad';
            healthColor = 'text-amber-500';
          }

          setReportData({
            avgHumidity: avgHum.toFixed(1),
            avgLuminosity: avgLum.toFixed(0),
            totalDevices: total,
            onlineDevices: online,
            wateringDevices: watering,
            activeLights: activeLights,
            hasLightDevices: hasLight,
            healthStatus: health,
            healthColor: healthColor
          });
        }
      } catch (error) {
        console.error("Error cargando los reportes globales:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGlobalReports();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FA] relative font-sans">
      
      {/* Header fijo en la parte superior */}
      <div className="px-6 pt-12 pb-4 shrink-0">
        <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight">
          Reportes Generales
        </h1>
        <p className="text-slate-500 text-sm font-medium mt-1">
          Promedios de todos tus cultivos
        </p>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center pb-20">
          <Loader2 className="animate-spin text-primary mb-4" size={40} />
          <p className="text-slate-500 font-medium animate-pulse">Analizando tus plantas...</p>
        </div>
      ) : (
        <div className="flex-1 px-6 flex flex-col space-y-5 overflow-y-auto pb-28">
          
          {/* Tarjeta Principal: Salud General */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl shadow-slate-200">
            <div className="flex items-center gap-3 mb-4 opacity-90">
              <Activity size={20} className="text-sky-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Estado Global del Cultivo</h2>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black tracking-tight mb-1">
                {reportData.healthStatus}
              </span>
              <span className="text-sm text-slate-400 font-medium">
                Basado en {reportData.totalDevices} sensor(es) activo(s)
              </span>
            </div>
          </div>

          {/* Grid de Métricas Secundarias */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Humedad Global */}
            <Card className="p-5 shadow-sm border-0 bg-white rounded-3xl flex flex-col justify-between">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 flex items-center justify-center mb-4">
                <Droplet size={20} className="text-sky-500" />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase mb-1">Humedad Promedio</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-800">{reportData.avgHumidity}</span>
                  <span className="text-lg font-bold text-slate-400">%</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Últimos 7 días</p>
              </div>
            </Card>

            {/* Bombas Activas */}
            <Card className="p-5 shadow-sm border-0 bg-white rounded-3xl flex flex-col justify-between">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                <Waves size={20} className="text-indigo-500" />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase mb-1">En Riego Ahora</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-800">{reportData.wateringDevices}</span>
                  <span className="text-sm font-bold text-slate-400">plantas</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">En tiempo real</p>
              </div>
            </Card>

            {/* SI TIENE UN DISPOSITIVO DE LUZ: Mostrar Estado Global de Luz y Luminosidad Promedio */}
            {reportData.hasLightDevices && (
              <>
                {/* Luminosidad Promedio */}
                <Card className="p-5 shadow-sm border-0 bg-white rounded-3xl flex flex-col justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
                    <Sun size={20} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-semibold uppercase mb-1">Luminosidad Prom.</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-800">{reportData.avgLuminosity}</span>
                      <span className="text-lg font-bold text-slate-400">lx</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Tiempo real</p>
                  </div>
                </Card>

                {/* Estado Global de Luz (Focos Activos) */}
                <Card className="p-5 shadow-sm border-0 bg-white rounded-3xl flex flex-col justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-yellow-50 flex items-center justify-center mb-4">
                    <Lightbulb size={20} className="text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-semibold uppercase mb-1">Focos Activos</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-800">{reportData.activeLights}</span>
                      <span className="text-sm font-bold text-slate-400">iluminados</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">En tiempo real</p>
                  </div>
                </Card>
              </>
            )}

          </div>

          {/* Tarjeta de Infraestructura (Dispositivos) */}
          <Card className="p-5 shadow-sm border-0 bg-white rounded-3xl mt-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <Cpu size={24} className="text-emerald-500" />
              </div>
              <div>
                <h3 className="text-slate-800 font-bold text-lg">Infraestructura</h3>
                <p className="text-slate-500 text-xs font-medium mt-0.5">
                  {reportData.onlineDevices} de {reportData.totalDevices} dispositivos en línea
                </p>
              </div>
            </div>
            
            {/* Gráfico circular */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100" />
                <circle 
                  cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" 
                  className="text-emerald-500 transition-all duration-1000 ease-out"
                  strokeDasharray={125} 
                  strokeDashoffset={reportData.totalDevices > 0 ? 125 - (125 * (reportData.onlineDevices / reportData.totalDevices)) : 125}
                />
              </svg>
            </div>
          </Card>

        </div>
      )}

      <BottomNav />
    </div>
  );
};