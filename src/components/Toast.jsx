import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

let _push;

export function useToast() {
  return { toast: _push };
}

const ICONS = { success: CheckCircle, danger: XCircle, warning: AlertCircle, info: Info };

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((msg, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  }, []);

  useEffect(() => { _push = push; }, [push]);

  return (
    <div className="toast-container">
      {toasts.map(({ id, msg, type }) => {
        const Icon = ICONS[type] || Info;
        return (
          <div key={id} className={`toast ${type}`}>
            <Icon size={16} />
            {msg}
          </div>
        );
      })}
    </div>
  );
}
