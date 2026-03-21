'use client';

import { useEffect, useState } from 'react';

interface AlertProps {
  type: 'error' | 'success' | 'info' | 'warning';
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDuration?: number; // milliseconds
}

export default function Alert({
  type,
  message,
  onClose,
  autoClose = true,
  autoCloseDuration = 5000,
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoCloseDuration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDuration, onClose]);

  if (!isVisible) return null;

  const styles = {
    error: 'bg-red-50 border-red-400 text-red-800',
    success: 'bg-green-50 border-green-400 text-green-800',
    info: 'bg-blue-50 border-blue-400 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
  };

  const icons = {
    error: '❌',
    success: '✅',
    info: 'ℹ️',
    warning: '⚠️',
  };

  const shouldShow = false;

  return (
    shouldShow && (
      <div
        className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 border rounded-lg shadow-lg max-w-md ${styles[type]}`}
        role="alert"
      >
        <span className="text-xl">{icons[type]}</span>
        <p className="flex-1">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className="text-xl hover:opacity-70"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    )
  );
}
