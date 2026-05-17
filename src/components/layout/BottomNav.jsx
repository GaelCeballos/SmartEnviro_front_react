import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BarChart2, User } from 'lucide-react';

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Función para saber si la ruta actual coincide con la del botón
  const isActive = (path) => location.pathname === path;

  return (
    <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 px-6 py-4 pb-6 flex justify-between items-center z-50">
      
      {/* Botón Inicio */}
      <button 
        onClick={() => navigate('/dashboard')}
        className={`flex flex-col items-center flex-1 transition-colors ${
          isActive('/dashboard') ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <Home size={24} strokeWidth={isActive('/dashboard') ? 2.5 : 2} />
        <span className={`text-[11px] mt-1.5 ${isActive('/dashboard') ? 'font-bold' : 'font-semibold'}`}>
          Inicio
        </span>
      </button>
      
      {/* Botón Reportes */}
      <button 
        onClick={() => navigate('/reportes')}
        className={`flex flex-col items-center flex-1 transition-colors ${
          isActive('/reportes') ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <BarChart2 size={24} strokeWidth={isActive('/reportes') ? 2.5 : 2} />
        <span className={`text-[11px] mt-1.5 ${isActive('/reportes') ? 'font-bold' : 'font-semibold'}`}>
          Reportes
        </span>
      </button>
      
      {/* Botón Perfil */}
      <button 
        onClick={() => navigate('/perfil')}
        className={`flex flex-col items-center flex-1 transition-colors ${
          isActive('/perfil') ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <User size={24} strokeWidth={isActive('/perfil') ? 2.5 : 2} />
        <span className={`text-[11px] mt-1.5 ${isActive('/perfil') ? 'font-bold' : 'font-semibold'}`}>
          Perfil
        </span>
      </button>
      
      {/* Indicador estilo iOS */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-200 rounded-full"></div>
    </div>
  );
};