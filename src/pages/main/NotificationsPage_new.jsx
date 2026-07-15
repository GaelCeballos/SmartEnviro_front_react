import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import NotificationContext from '../../contexts/NotificationContext';

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const { unread, read, markAsRead, markAllAsRead } = useContext(NotificationContext);

  const handleClickUnread = (id) => {
    markAsRead(id);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FA] relative">
      <div className="flex items-center px-6 pt-12 pb-6">
        <button onClick={() => navigate(-1)} className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm">
          <ChevronLeft className="text-slate-600" size={24} />
        </button>
        <h1 className="text-[18px] font-bold text-[#1F2937] ml-4">Notificaciones</h1>
      </div>

      <div className="px-6 flex flex-col space-y-4 overflow-y-auto pb-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Nuevas / Sin leer</h2>
          {unread.length > 0 ? (
            <button onClick={markAllAsRead} className="text-sm text-primary font-medium">Marcar todas como leídas</button>
          ) : null}
        </div>

        {unread.length === 0 && (
          <div className="py-8">
            <p className="text-slate-500">No hay notificaciones sin leer.</p>
          </div>
        )}

        {unread.map((n) => (
          <Card key={n.id} onClick={() => handleClickUnread(n.id)} className="flex p-4 bg-white border-0 shadow-sm rounded-2xl gap-4 cursor-pointer">
            <div className={`w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0`}>
              <div className="text-primary font-bold">🔔</div>
            </div>
            <div className="flex flex-col flex-1">
              <div className="flex justify-between items-start">
                <span className="font-bold text-[#1F2937] text-[15px]">{n.title}</span>
                <span className="text-slate-400 text-[11px]">{n.timestamp ? new Date(n.timestamp).toLocaleString() : ''}</span>
              </div>
              <p className="text-slate-500 text-[13px] mt-1 leading-tight">{n.message}</p>
            </div>
          </Card>
        ))}

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Historial</h2>

          {read.length === 0 && (
            <div className="py-8">
              <p className="text-slate-500">Aún no hay historial de notificaciones.</p>
            </div>
          )}

          {read.map((n) => (
            <Card key={n.id} className="flex p-4 bg-white border-0 shadow-sm rounded-2xl gap-4">
              <div className={`w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0`}>
                <div className="text-slate-400">🔔</div>
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-[#1F2937] text-[15px]">{n.title}</span>
                  <span className="text-slate-400 text-[11px]">{n.read_at ? new Date(n.read_at).toLocaleString() : ''}</span>
                </div>
                <p className="text-slate-500 text-[13px] mt-1 leading-tight">{n.message}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
