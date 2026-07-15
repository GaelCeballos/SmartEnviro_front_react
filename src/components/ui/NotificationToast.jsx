import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useContext } from 'react';
import NotificationContext from '../../contexts/NotificationContext';

export const NotificationToast = () => {
  const { unread } = useContext(NotificationContext);
  const location = useLocation();
  const prevIdsRef = useRef(new Set());
  const [queue, setQueue] = useState([]);
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // Determinar rutas excluidas (sin sesión o sin notificaciones)
    const path = location.pathname || '';
    const token = localStorage.getItem('auth_token');
    
    // Excluir: login, registro, y rutas de configuración
    const excluded = 
      !token ||
      path.startsWith('/login') || 
      path.startsWith('/registro') ||
      path.startsWith('/perfil/notificaciones') || 
      path.startsWith('/perfil/configuracion');

    // Si estamos en ruta excluida, limpiar todo
    if (excluded) {
      setQueue([]);
      setCurrent(null);
      setVisible(false);
      return;
    }

    // compute new unread notifications (ids not in prev)
    const currentIds = new Set(unread.map((u) => u.id));
    const prevIds = prevIdsRef.current;

    const newOnes = unread.filter((u) => !prevIds.has(u.id));

    if (newOnes.length > 0 && !excluded) {
      // add to queue (most recent first)
      setQueue((q) => [...newOnes.reverse(), ...q]);
    }

    // update prevIds
    prevIdsRef.current = currentIds;
  }, [unread, location]);

  useEffect(() => {
    if (!current && queue.length > 0) {
      // show next
      const next = queue[0];
      setCurrent(next);
      setQueue((q) => q.slice(1));
      setVisible(true);

      // auto-dismiss after 5s
      timerRef.current = setTimeout(() => {
        setVisible(false);
        // Limpiar después de la animación
        setTimeout(() => setCurrent(null), 300);
      }, 5000);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [queue, current]);

  if (!current) return null;

  return (
    <div className={`fixed left-1/2 transform -translate-x-1/2 top-6 z-50 transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
      <div className="max-w-md w-[90vw] bg-white shadow-xl rounded-xl border border-slate-100 p-4 flex gap-3 items-start">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">{/* icon placeholder */}🔔</div>
        <div className="flex-1">
          <div className="font-bold text-sm text-[#0F172A]">{current.title}</div>
          <div className="text-sm text-slate-500 mt-1 leading-tight">{current.message}</div>
        </div>
      </div>
    </div>
  );
};


export default NotificationToast;
