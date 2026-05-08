import React, { useState } from 'react';
import { Droplet } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // <-- Nuevo estado para guardar errores

  const handleLogin = (e) => {
    e.preventDefault();
    setError(''); // Limpiamos errores anteriores al volver a intentar

    // 1. Validación de campos vacíos
    if (!email.trim() || !password.trim()) {
      setError('Por favor, completa todos los campos.');
      return; // Detiene la ejecución aquí
    }

    // 2. Validación básica de formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }

    // 3. Simulación de error de credenciales (Luego lo conectaremos a Laravel)
    if (email === 'admin@admin.com' && password === '123456') {
      console.log('Iniciando sesión con:', email, password);
      alert(`Bienvenido: ${email}`);
    } else {
      // Si escriben cualquier otra cosa, mostramos error de credenciales
      setError('Correo o contraseña incorrectos. Intenta de nuevo.');
    }
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
          
          {/* Mensaje de Error Condicional */}
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
              setError(''); // Ocultar error cuando el usuario empieza a escribir de nuevo
            }}
          />
          
          <Input 
            label="Contraseña" 
            type="password"
            placeholder="••••••••" 
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(''); // Ocultar error cuando el usuario empieza a escribir de nuevo
            }}
          />
          
          <div className="pt-2">
            <Button type="submit">
              Iniciar Sesión
            </Button>
          </div>
        </form>
      </Card>

      {/* Footer / Recuperar contraseña */}
      <div className="mt-8 text-center">
        <button className="text-primary font-semibold text-base hover:underline">
          ¿Olvidaste tu contraseña?
        </button>
      </div>
      
    </div>
  );
};