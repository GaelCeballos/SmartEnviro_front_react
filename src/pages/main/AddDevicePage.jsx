import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, RefreshCw, Wifi, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';

// Importamos los servicios recién creados
import { getAvailableDevices, claimDevice } from '../../services/deviceService';

export const AddDevicePage = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [isLinkingId, setIsLinkingId] = useState(null); // Guarda el ID del dispositivo que se está vinculando
  const [hasScanned, setHasScanned] = useState(false); // Para saber si ya buscamos al menos una vez

  // Función real para consultar los dispositivos sin dueño en Laravel
  const handleScan = async () => {
    setIsScanning(true);
    setHasScanned(true);

    const { ok, data } = await getAvailableDevices();

    if (ok && data.status === 'success') {
      setDevices(data.data);
    } else {
      alert(data.message || 'No se pudieron buscar dispositivos.');
    }
    
    setIsScanning(false);
  };

  // Función para mandar el POST de vinculación a Laravel
  const handleBindDevice = async (id) => {
    setIsLinkingId(id); // Bloqueamos visualmente solo este botón

    const { ok, data } = await claimDevice(id);

    if (ok && data.status === 'success') {
      alert('¡Dispositivo vinculado con éxito!');
      // Redirigimos de vuelta al dashboard para ver el nuevo dispositivo en la lista
      navigate('/dashboard'); 
    } else {
      alert(data.message || 'Ocurrió un error al vincular el dispositivo.');
      setIsLinkingId(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FA] relative pb-10">
      
      {/* 1. Header */}
      <div className="flex items-center px-6 pt-12 pb-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform"
        >
          <ChevronLeft className="text-slate-600" size={24} />
        </button>
        <h1 className="text-[18px] font-bold text-[#1F2937] ml-4 flex-1">
          Añadir Dispositivo
        </h1>
      </div>

      <div className="px-6 flex flex-col space-y-6">
        
        {/* 2. Botón de Escaneo */}
        <button
          onClick={handleScan}
          disabled={isScanning || isLinkingId !== null}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full border-[1.5px] border-primary text-primary font-bold text-[15px] bg-white active:bg-primary/5 transition-colors disabled:opacity-70"
        >
          <RefreshCw 
            className={isScanning ? 'animate-spin' : ''} 
            size={20} 
            strokeWidth={2.5}
          />
          {isScanning ? 'Buscando dispositivos...' : 'Escanear Redes Cercanas'}
        </button>

        {/* Subtítulo */}
        <h2 className="text-[14px] font-bold text-slate-500 mt-2">
          Dispositivos Detectados
        </h2>

        {/* 3. Lista Dinámica de Dispositivos */}
        <div className="flex flex-col space-y-4">
          
          {/* Caso 1: Aún no se ha presionado Escanear */}
          {!hasScanned && !isScanning && (
            <div className="text-center py-8 text-slate-400 text-sm">
              Presiona el botón de arriba para buscar dispositivos listos para enlazar.
            </div>
          )}

          {/* Caso 2: Escaneando activamente */}
          {isScanning && (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400 text-sm">
              <Loader2 className="animate-spin text-primary mb-2" size={28} />
              Sincronizando con la red...
            </div>
          )}

          {/* Caso 3: Escaneo terminado pero no se encontró nada disponible */}
          {hasScanned && !isScanning && devices.length === 0 && (
            <div className="text-center py-8 bg-white border border-dashed border-slate-200 rounded-2xl text-slate-500 font-medium">
              No se encontraron nuevos dispositivos sin asignar en la red.
            </div>
          )}

          {/* Caso 4: Despliegue de los dispositivos reales devueltos por Laravel */}
          {hasScanned && !isScanning && devices.map((device) => (
            <Card key={device.id} className="p-4 bg-white border-0 shadow-sm rounded-2xl flex flex-col space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#E6F8F5] flex items-center justify-center flex-shrink-0">
                  <Wifi className="text-primary" size={28} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-[#1F2937] font-extrabold text-[15px]">
                    {device.name}
                  </span>
                  <span className="text-slate-400 text-[12px] font-mono mt-0.5">
                    MAC: {device.mac_address}
                  </span>
                  <span className="text-primary text-[13px] font-semibold mt-0.5">
                    {device.is_online ? '● En línea (Listo)' : '○ Desconectado'}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => handleBindDevice(device.id)}
                disabled={isLinkingId !== null}
                className="w-full bg-primary text-white font-bold text-[15px] py-3.5 rounded-[14px] shadow-md active:scale-[0.98] transition-transform flex items-center justify-center disabled:opacity-50"
              >
                {isLinkingId === device.id ? (
                  <Loader2 className="animate-spin mr-2" size={18} />
                ) : null}
                {isLinkingId === device.id ? 'Vinculando...' : 'Vincular a mi cuenta'}
              </button>
            </Card>
          ))}

        </div>
      </div>
    </div>
  );
};