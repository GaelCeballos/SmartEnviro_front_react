import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/main/DashboardPage';
import { DeviceDetailPage } from './pages/main/DeviceDetailPage';
import { AddDevicePage } from './pages/main/AddDevicePage'; 
import { ReportsPage } from './pages/main/ReportsPage';
import { ProfilePage } from './pages/main/ProfilePage';
import { NotificationsPage } from './pages/main/NotificationsPage';
import { ChangePasswordPage } from './pages/main/ChangePasswordPage';
import { SettingsPage } from './pages/main/SettingsPage';
import { UpdateInfoPage } from './pages/main/UpdateInfoPage';
import { RegisterPage } from './pages/auth/RegisterPage';

function App() {
  return (
    <div className="w-full max-w-md min-h-screen bg-background shadow-2xl relative overflow-x-hidden">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/device/:id" element={<DeviceDetailPage />} />
          <Route path="/add-device" element={<AddDevicePage />} />
          
          <Route path="/reportes" element={<ReportsPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          
          {/* RUTAS CONECTADAS DIRECTAMENTE A TUS ARCHIVOS */}
          <Route path="/perfil/notificaciones" element={<NotificationsPage />} />
          
          {/* Configuración: menú con opciones -> info / contraseña */}
          <Route path="/perfil/configuracion" element={<SettingsPage />} />
          <Route path="/perfil/configuracion/informacion" element={<UpdateInfoPage />} />
          <Route path="/perfil/configuracion/contraseña" element={<ChangePasswordPage />} />
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;