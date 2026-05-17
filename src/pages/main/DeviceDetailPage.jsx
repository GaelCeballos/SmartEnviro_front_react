import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Plus, Droplet, Waves } from 'lucide-react';
import { Card } from '../../components/ui/Card';

export const DeviceDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Simulamos EXACTAMENTE la respuesta de tu controlador de Laravel
  const [deviceData, setDeviceData] = useState({
    id: id,
    name: 'Bomba de Riego - Terraza',
    is_online: true,
    state: 'ON',
    settings: {
      auto_water: false,
      humidity_threshold: 40,
    },
    capabilities: {
      has_pump: true,
      has_humidity: true,
    },
    history: [
      { value: 30 }, { value: 60 }, { value: 25 }, 
      { value: 80 }, { value: 45 }, { value: 65 }, 
      { value: 40 }, { value: 55 }, { value: 75 }
    ]
  });

  // Función temporal para simular el toggle
  const toggleManualControl = () => {
    setDeviceData({
      ...deviceData,
      state: deviceData.state === 'ON' ? 'OFF' : 'ON'
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FA] relative pb-24">
      
      {/* Header */}
      <div className="flex justify-between items-center px-6 pt-12 pb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
        >
          <ChevronLeft className="text-slate-600" size={24} />
        </button>
        
        <h1 className="text-[17px] font-bold text-[#1F2937] truncate px-4">
          {deviceData.name}
        </h1>
        
        <button className="bg-primary w-10 h-10 rounded-full flex items-center justify-center shadow-sm">
          <Plus className="text-white" size={24} strokeWidth={2.5} />
        </button>
      </div>

      <div className="px-6 flex flex-col space-y-6">
        
        {/* Control Manual Toggle */}
        <Card className="flex items-center justify-between p-4 bg-white border-0 shadow-sm rounded-2xl">
          <span className="text-[#1F2937] font-semibold text-[15px]">Control Manual</span>
          <button 
            onClick={toggleManualControl}
            className={`w-[50px] h-[28px] flex items-center rounded-full p-1 transition-colors duration-300 ${
              deviceData.state === 'ON' ? 'bg-primary' : 'bg-gray-300'
            }`}
          >
            <div 
              className={`bg-white w-[20px] h-[20px] rounded-full shadow-sm transform transition-transform duration-300 ${
                deviceData.state === 'ON' ? 'translate-x-[22px]' : 'translate-x-0'
              }`} 
            />
          </button>
        </Card>

        {/* Título de sección */}
        <h2 className="text-[16px] font-bold text-[#1F2937] mt-2">Control Manual</h2>

        {/* Grid de Métricas */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Tarjeta Humedad */}
          {deviceData.capabilities.has_humidity && (
            <Card className="flex flex-col items-center justify-center p-6 bg-white border-0 shadow-sm rounded-2xl">
              <Droplet className="text-primary mb-3" size={32} strokeWidth={2} />
              <span className="text-primary text-3xl font-bold mb-1">25%</span>
              <span className="text-slate-400 text-[11px] text-center font-medium leading-tight">
                Humedad del<br/>Suelo
              </span>
            </Card>
          )}

          {/* Tarjeta Flujo de agua */}
          {deviceData.capabilities.has_pump && (
            <Card className="flex flex-col items-center justify-center p-6 bg-white border-0 shadow-sm rounded-2xl">
              <Waves className="text-primary mb-3" size={32} strokeWidth={2} />
              <span className="text-primary text-3xl font-bold mb-1">0.5</span>
              <span className="text-primary text-sm font-bold mb-1">L/min</span>
              <span className="text-slate-400 text-[11px] text-center font-medium leading-tight">
                Flujo de Agua
              </span>
            </Card>
          )}
        </div>

        {/* Título de sección */}
        <h2 className="text-[16px] font-bold text-[#1F2937] mt-2">Metricas Clave</h2>

        {/* Gráfico de Tendencia */}
        <Card className="p-5 bg-white border-0 shadow-sm rounded-2xl">
          <h3 className="text-[#334155] font-semibold text-[15px]">Grafico de Tendencia</h3>
          <p className="text-slate-400 text-[12px] mb-6">(Humedad vs. Tiempo)</p>
          
          {/* Simulación visual de gráfico de barras */}
          <div className="flex items-end justify-between h-32 gap-2">
            {deviceData.history.map((item, index) => (
              <div 
                key={index} 
                className="w-full bg-primary rounded-t-md hover:opacity-80 transition-opacity" 
                style={{ height: `${item.value}%` }}
              ></div>
            ))}
          </div>
        </Card>

      </div>

      {/* Botón Flotante Inferior CORREGIDO */}
      <div className="absolute bottom-6 left-0 w-full px-6">
        <button className="w-full bg-primary text-white font-semibold text-[16px] py-4 rounded-2xl shadow-lg active:scale-95 transition-transform">
          Editar Configuracion
        </button>
      </div>

    </div>
  );
};