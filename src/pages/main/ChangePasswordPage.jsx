import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Lock } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');

  const handleUpdate = (e) => {
    e.preventDefault();
    alert("Contraseña actualizada con éxito");
    navigate(-1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FA]">
      <div className="flex items-center px-6 pt-12 pb-6">
        <button onClick={() => navigate(-1)} className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm">
          <ChevronLeft className="text-slate-600" size={24} />
        </button>
        <h1 className="text-[18px] font-bold text-[#1F2937] ml-4">Cambiar Contraseña</h1>
      </div>

      <form onSubmit={handleUpdate} className="px-6 flex flex-col space-y-5">
        <div className="bg-primary/10 p-6 rounded-3xl flex justify-center mb-4">
          <Lock size={48} className="text-primary" />
        </div>

        <Input 
          label="Contraseña Actual" 
          type="password" 
          placeholder="••••••••"
          value={currentPass}
          onChange={(e) => setCurrentPass(e.target.value)}
        />
        <Input 
          label="Nueva Contraseña" 
          type="password" 
          placeholder="••••••••"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
        />

        <div className="pt-4">
          <Button type="submit">Actualizar Contraseña</Button>
        </div>
      </form>
    </div>
  );
};