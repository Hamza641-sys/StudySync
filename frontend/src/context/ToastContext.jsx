import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {toasts.map(t => {
          let bg = '#1e293b';
          let border = '#334155';
          let icon = 'ℹ️';

          if (t.type === 'success') {
            bg = 'rgba(6, 78, 59, 0.95)';
            border = '#059669';
            icon = '✅';
          } else if (t.type === 'error') {
            bg = 'rgba(127, 29, 29, 0.95)';
            border = '#dc2626';
            icon = '⚠️';
          }

          return (
            <div key={t.id} style={{
              background: bg,
              border: `1px solid ${border}`,
              color: '#ffffff',
              padding: '12px 18px',
              borderRadius: '12px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.9rem',
              fontWeight: 500,
              minWidth: '260px',
              animation: 'fadeIn 0.25s ease'
            }}>
              <span>{icon}</span>
              <span>{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
