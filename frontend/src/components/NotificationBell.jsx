/*import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={handleToggle}
        className="relative p-2 text-gray-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-slate-800 flex justify-between items-center text-sm font-semibold text-white">
            <span>Notifications</span>
            <span className="text-xs text-slate-400">{notifications.length} Total</span>
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-800">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-sm text-slate-400">No notifications</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`p-3 text-sm ${n.is_read ? 'opacity-60' : 'bg-slate-800/40'}`}>
                  <p className="font-semibold text-white">{n.title}</p>
                  <p className="text-slate-300 text-xs mt-0.5">{n.message}</p>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}*/
