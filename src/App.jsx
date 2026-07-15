import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/main/DashboardPage';
import { DeviceDetailPage } from './pages/main/DeviceDetailPage';
import { AddDevicePage } from './pages/main/AddDevicePage'; 
import { ReportsPage } from './pages/main/ReportsPage';
import { ProfilePage } from './pages/main/ProfilePage';
import NotificationsPage from './pages/main/NotificationsPage_new';
import { ChangePasswordPage } from './pages/main/ChangePasswordPage';
import { SettingsPage } from './pages/main/SettingsPage';
import { UpdateInfoPage } from './pages/main/UpdateInfoPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationToast from './components/ui/NotificationToast';
import { ProtectedRoute } from './components/routing/ProtectedRoute';

function App() {
  return (
    <div className="w-full max-w-md min-h-screen bg-background shadow-2xl relative overflow-x-hidden">
      <BrowserRouter>
        <NotificationProvider>
          <NotificationToast />
          <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/device/:id" element={<ProtectedRoute><DeviceDetailPage /></ProtectedRoute>} />
          <Route path="/add-device" element={<ProtectedRoute><AddDevicePage /></ProtectedRoute>} />
          
          <Route path="/reportes" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          
          {/* RUTAS CONECTADAS DIRECTAMENTE A TUS ARCHIVOS */}
          <Route path="/perfil/notificaciones" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          
          {/* Configuración: menú con opciones -> info / contraseña */}
          <Route path="/perfil/configuracion" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/perfil/configuracion/informacion" element={<ProtectedRoute><UpdateInfoPage /></ProtectedRoute>} />
          <Route path="/perfil/configuracion/contraseña" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        </NotificationProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;