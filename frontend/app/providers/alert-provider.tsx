'use client';

import Alert from '@/components/ui/Alert/Alert';
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from 'react';

type AlertType = 'error' | 'success' | 'info' | 'warning';

interface AlertContextType {
  showAlert: (type: AlertType, message: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<{
    type: AlertType;
    message: string;
  } | null>(null);

  const showAlert = useCallback((type: AlertType, message: string) => {
    setAlert({ type, message });
  }, []);

  const handleClose = useCallback(() => {
    setAlert(null);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={handleClose}
        />
      )}
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
}
