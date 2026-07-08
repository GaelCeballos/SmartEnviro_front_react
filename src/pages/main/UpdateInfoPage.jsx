import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { updateProfileInfo } from '../../services/profileService';

export const UpdateInfoPage = () => {
  const navigate = useNavigate();

  const userString = localStorage.getItem('user_data');
  const user = userString ? JSON.parse(userString) : { name: '', email: '' };

  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('auth_token');
    const payload = { name, email };

    const res = await updateProfileInfo(token, payload);
    setLoading(false);

    if (res.ok) {
      // actualizar user_data local
      const updatedUser = { ...user, name, email };
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      alert(res.data.message || 'Perfil actualizado correctamente');
      navigate(-1);
    } else {
      // manejar errores de validación
      if (res.data && res.data.errors) {
        const first = Object.values(res.data.errors)[0];
        setError(Array.isArray(first) ? first[0] : first);
      } else {
        setError(res.data.message || 'Error al actualizar');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FA]">
      <div className="flex items-center px-6 pt-12 pb-6">
        <button onClick={() => navigate(-1)} className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm">
          <ChevronLeft className="text-slate-600" size={24} />
        </button>
        <h1 className="text-[18px] font-bold text-[#1F2937] ml-4">Actualizar Información</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-6 flex flex-col space-y-5">
        <div className="bg-primary/10 p-6 rounded-3xl flex justify-center mb-4">
          <User size={48} className="text-primary" />
        </div>

        {error && <div className="text-red-600 font-medium">{error}</div>}

        <Input label="Nombre" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
        <Input label="Correo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" />

        <div className="pt-4">
          <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Actualizar Información'}</Button>
        </div>
      </form>
    </div>
  );
};

export default UpdateInfoPage;
