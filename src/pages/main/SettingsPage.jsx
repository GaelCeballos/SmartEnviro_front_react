import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ChevronLeft } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { BottomNav } from '../../components/layout/BottomNav';

export const SettingsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FA] relative">
      <div className="px-6 pt-12 pb-6 flex items-center">
        <button onClick={() => navigate(-1)} className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm">
          <ChevronLeft className="text-slate-600" size={24} />
        </button>
        <h1 className="text-[20px] font-extrabold text-[#1F2937] ml-4">Configuración</h1>
      </div>

      <div className="px-6 flex flex-col space-y-4 overflow-y-auto pb-28">
        <Card onClick={() => navigate('/perfil/configuracion/informacion')} className="flex items-center justify-between p-4 shadow-sm border-0 bg-white rounded-2xl active:bg-slate-50 cursor-pointer">
          <div className="flex items-center gap-4">
            <User className="text-primary" size={22} />
            <span className="text-[#1F2937] font-semibold text-[15px]">Actualizar Información</span>
          </div>
        </Card>

        <Card onClick={() => navigate('/perfil/configuracion/contraseña')} className="flex items-center justify-between p-4 shadow-sm border-0 bg-white rounded-2xl active:bg-slate-50 cursor-pointer">
          <div className="flex items-center gap-4">
            <Lock className="text-primary" size={22} />
            <span className="text-[#1F2937] font-semibold text-[15px]">Actualizar Contraseña</span>
          </div>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default SettingsPage;
