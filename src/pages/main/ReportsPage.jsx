import React from 'react';
import { Card } from '../../components/ui/Card';
import { BottomNav } from '../../components/layout/BottomNav';

export const ReportsPage = () => {
  // Simulamos las estadísticas que llegarán de tu backend o estado global
  const reportData = [
    {
      id: 1,
      title: 'Consumo de Agua',
      value: '125 L',
      subtitle: 'Esta semana'
    },
    {
      id: 2,
      title: 'Horas de Riego',
      value: '8.5 hrs',
      subtitle: 'Esta semana'
    },
    {
      id: 3,
      title: 'Humedad Promedio',
      value: '42%',
      subtitle: 'Ultimos 7 dias'
    }
  ];

  return (
    // Usamos h-screen para que la pantalla no scrollee más allá de la barra de navegación
    <div className="flex flex-col h-screen bg-[#F7F9FA] relative">
      
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-[28px] font-extrabold text-[#1F2937]">
          Reportes
        </h1>
      </div>

      {/* Lista de Tarjetas de Reporte (Deslizable) */}
      <div className="px-6 flex flex-col space-y-4 overflow-y-auto pb-28">
        {reportData.map((item) => (
          <Card key={item.id} className="p-5 shadow-sm border-0 bg-white rounded-2xl flex flex-col">
            <span className="text-[#1F2937] font-semibold text-[15px] mb-1">
              {item.title}
            </span>
            <span className="text-primary text-[32px] font-bold leading-none mb-1">
              {item.value}
            </span>
            <span className="text-slate-400 text-[13px] font-medium">
              {item.subtitle}
            </span>
          </Card>
        ))}
      </div>

      {/* Componente de Navegación Inferior */}
      <BottomNav />
      
    </div>
  );
};