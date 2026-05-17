import React, { useState } from 'react';
import { Droplet, ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/authService';

export const RegisterPage = () => {
  const navigate = useNavigate(); 
  
  // Estados para todos los campos solicitados
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailConfirm, setEmailConfirm] = useState(''); // Nuevo estado para confirmar correo
  const [password, setPassword] = useState(''); 
  const [passwordConfirm, setPasswordConfirm] = useState(''); 
  
  const [error, setError] = useState('');       
  const [success, setSuccess] = useState('');       
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 1. Validar que ningún campo esté vacío
    if (!name.trim() || !email.trim() || !emailConfirm.trim() || !password.trim() || !passwordConfirm.trim()) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    // 2. Validar que los correos coincidan
    if (email !== emailConfirm) {
      setError('Los correos electrónicos no coinciden.');
      return;
    }

    // 3. Validar que las contraseñas coincidan
    if (password !== passwordConfirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    // 4. Validar longitud de contraseña
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setIsLoading(true);

    // Llamamos al servicio (Laravel solo necesita nombre, un correo y las contraseñas)
    const { ok, data } = await registerUser(name, email, password, passwordConfirm);

    if (ok && data.status === 'success') {
      setSuccess('¡Registro exitoso! Redirigiendo al login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      // Manejar errores de validación de Laravel (ej. correo ya registrado)
      if (data.errors) {
        const firstError = Object.values(data.errors)[0][0];
        setError(firstError);
      } else {
        setError(data.message || 'Error al registrar la cuenta.');
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-12 min-h-screen relative">
      
      {/* Botón de regresar al Login */}
      <button 
        onClick={() => navigate('/login')} 
        className="absolute top-12 left-6 bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors"
      >
        <ArrowLeft className="text-slate-600" size={24} />
      </button>

      {/* Encabezado */}
      <div className="flex flex-col items-center mb-8 mt-6">
        <div className="bg-primary/10 p-3 rounded-full mb-3">
          <Droplet size={36} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-textDark text-center">
          Crear Cuenta
        </h1>
        <p className="text-textLight text-center mt-1 text-base">
          Únete a Smart Enviro
        </p>
      </div>

      {/* Formulario */}
      <Card>
        <form onSubmit={handleRegister} className="flex flex-col space-y-4">
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium text-center animate-pulse">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm font-medium text-center">
              {success}
            </div>
          )}

          {/* Campo de Nombre */}
          <Input 
            label="Nombre Completo" 
            type="text"
            placeholder="Juan Pérez" 
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            disabled={isLoading || success}
          />

          {/* Campos de Correo */}
          <Input 
            label="Correo Electrónico" 
            type="email"
            placeholder="ejemplo@correo.com" 
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            disabled={isLoading || success}
          />
          
          <Input 
            label="Confirmar Correo" 
            type="email"
            placeholder="Repite tu correo electrónico" 
            value={emailConfirm}
            onChange={(e) => { setEmailConfirm(e.target.value); setError(''); }}
            disabled={isLoading || success}
          />
          
          {/* Campos de Contraseña */}
          <Input 
            label="Contraseña" 
            type="password"
            placeholder="Mínimo 8 caracteres" 
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            disabled={isLoading || success}
          />

          <Input 
            label="Confirmar Contraseña" 
            type="password"
            placeholder="Repite tu contraseña" 
            value={passwordConfirm}
            onChange={(e) => { setPasswordConfirm(e.target.value); setError(''); }}
            disabled={isLoading || success}
          />
          
          <div className="pt-4">
            <Button type="submit" disabled={isLoading || success}>
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </Button>
          </div>
        </form>
      </Card>
      
    </div>
  );
};