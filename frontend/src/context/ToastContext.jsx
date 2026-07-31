import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let idCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'success') => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), 3500);
    },
    [removeToast]
  );

  const icons = {
    success: <CheckCircle2 size={20} className="text-mehendi shrink-0" />,
    error: <XCircle size={20} className="text-rani shrink-0" />,
    info: <Info size={20} className="text-indigo_ink shrink-0" />,
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-[calc(100%-2.5rem)] sm:w-auto">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-popIn bg-white rounded-2xl shadow-soft border-2 border-ink/5 px-4 py-3 flex items-center gap-2.5"
          >
            {icons[t.type]}
            <p className="text-sm font-body font-semibold text-ink flex-1">{t.message}</p>
            <button onClick={() => removeToast(t.id)} className="text-ink/40 hover:text-ink shrink-0">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
