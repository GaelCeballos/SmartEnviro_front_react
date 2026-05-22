import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { BottomNav } from '../../components/layout/BottomNav'; 
import { getUserDevices, getDeviceSensorHistory } from '../../services/deviceService';
import { Loader2, Droplet, Activity, Cpu, Waves } from 'lucide-react';

export const ReportsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState({
    avgHumidity: 0,
    totalDevices: 0,
    onlineDevices: 0,
    wateringDevices: 0,
    healthStatus: 'Calculando...'
  });

  useEffect(() => {
    const fetchGlobalReports = async () => {
      setIsLoading(true);
      try {
        // 1. Obtener la lista de todos los dispositivos del usuario
        const devRes = await getUserDevices();
        
        if (devRes.ok && devRes.data) {
          const devices = Array.isArray(devRes.data) ? devRes.data : (devRes.data.data || []);
          
          const total = devices.length;
          const online = devices.filter(d => d.is_online).length;
          const watering = devices.filter(d => d.current_state === 'ON' || d.current_state === 'WATERING').length;

          // 2. Obtener el historial de la SEMANA de TODOS los dispositivos
          const historyPromises = devices.map(d => getDeviceSensorHistory(d.id, 'week', 1));
          const historiesRes = await Promise.all(historyPromises);

          let totalHumiditySum = 0;
          let totalReadingsCount = 0;

          // 3. Sumar y promediar todas las lecturas devueltas
          historiesRes.forEach(res => {
            if (res.ok && res.data?.data) {
              res.data.data.forEach(reading => {
                totalHumiditySum += parseFloat(reading.value);
                totalReadingsCount += 1;
              });
            }
          });

          const avgHum = totalReadingsCount > 0 ? (totalHumiditySum / totalReadingsCount) : 0;

          // 4. Calcular el "Estado de Salud" general
          let health = 'Óptimo';
          let healthColor = 'text-emerald-500';
          if (total === 0) {
            health = 'Sin dispositivos';
            healthColor = 'text-slate-400';
          } else if (avgHum < 30) {
            health = 'Crítico (Muy seco)';
            healthColor = 'text-rose-500';
          } else if (avgHum > 80) {
            health = 'Atención (Exceso de humedad)';
            healthColor = 'text-amber-500';
          }

          setReportData({
            avgHumidity: avgHum.toFixed(1),
            totalDevices: total,
            onlineDevices: online,
            wateringDevices: watering,
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
    // Contenedor principal ajustado a la altura de la pantalla
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
        // Contenedor con scroll interno para las tarjetas
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

      {/* BARRA DE NAVEGACIÓN AÑADIDA */}
      <BottomNav />
    </div>
  );
};