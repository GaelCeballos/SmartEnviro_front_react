import React, { useState } from 'react';
import { Droplet } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

// Importamos el servicio que se comunica con Laravel
import { loginUser } from '../../services/authService';

export const LoginPage = () => {
  const navigate = useNavigate(); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [error, setError] = useState('');       
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones locales
    if (!email.trim() || !password.trim()) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }

    setIsLoading(true);

    // Llamamos a la función que se conecta con Laravel
    const { ok, data } = await loginUser(email, password);

    if (ok && data.status === 'success') {
      // Guardamos el token y los datos del usuario en el navegador
      localStorage.setItem('auth_token', data.data.token);
      localStorage.setItem('user_data', JSON.stringify(data.data.user));
      
      // Viajamos al DASHBOARD
      navigate('/dashboard'); 
    } else {
      // Mostramos el error si las credenciales son incorrectas o hay fallo de red
      setError(data.message || 'Error al iniciar sesión. Intenta de nuevo.');
    }

    setIsLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-12 min-h-screen">
      
      {/* Encabezado y Logo */}
      <div className="flex flex-col items-center mb-10">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <Droplet size={48} className="text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-textDark text-center">
          Smart Enviro
        </h1>
        <p className="text-textLight text-center mt-2 text-lg">
          Monitorea tu huerto inteligente
        </p>
      </div>

      {/* Formulario en Tarjeta */}
      <Card>
        <form onSubmit={handleLogin} className="flex flex-col space-y-4">
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium text-center animate-pulse">
              {error}
            </div>
          )}

          <Input 
            label="Correo Electrónico" 
            type="email"
            placeholder="ejemplo@correo.com" 
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(''); 
            }}
            disabled={isLoading}
          />
          
          <Input 
            label="Contraseña" 
            type="password"
            placeholder="••••••••" 
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(''); 
            }}
            disabled={isLoading}
          />
          
          <div className="pt-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Footer / Recuperar contraseña y Registro */}
      <div className="mt-8 flex flex-col items-center space-y-4">
        <button className="text-primary font-semibold text-base hover:underline" type="button">
          ¿Olvidaste tu contraseña?
        </button>
        
        {/* Enlace para ir a la vista de registro */}
        <div className="text-slate-500">
          ¿No tienes cuenta?{' '}
          <button 
            onClick={() => navigate('/registro')} 
            className="text-primary font-bold hover:underline" 
            type="button"
          >
            Regístrate aquí
          </button>
        </div>
      </div>
      
    </div>
  );
};