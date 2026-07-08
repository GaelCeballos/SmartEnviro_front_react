import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Lock } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { updateProfilePassword } from '../../services/profileService';

export const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('auth_token');
    const payload = {
      current_password: currentPass,
      password: newPass,
      password_confirmation: confirmPass,
    };

    const res = await updateProfilePassword(token, payload);
    setLoading(false);

    if (res.ok) {
      alert(res.data.message || 'Contraseña actualizada correctamente');
      navigate(-1);
    } else {
      if (res.data && res.data.errors) {
        const first = Object.values(res.data.errors)[0];
        setError(Array.isArray(first) ? first[0] : first);
      } else {
        setError(res.data.message || 'Error al actualizar contraseña');
      }
    }
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

        {error && <div className="text-red-600 font-medium">{error}</div>}

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
        <Input 
          label="Confirmar Nueva Contraseña" 
          type="password" 
          placeholder="••••••••"
          value={confirmPass}
          onChange={(e) => setConfirmPass(e.target.value)}
        />

        <div className="pt-4">
          <Button type="submit" disabled={loading}>{loading ? 'Actualizando...' : 'Actualizar Contraseña'}</Button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordPage;