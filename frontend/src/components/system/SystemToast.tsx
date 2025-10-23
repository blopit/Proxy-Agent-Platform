'use client'

import React, { useEffect, useState } from 'react';
import { spacing, fontSize, borderRadius, colors } from '@/lib/design-system';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  variant?: ToastVariant;
  message: string;
  description?: string;
  duration?: number;
  onClose?: () => void;
  show?: boolean;
}

const variantConfig: Record<ToastVariant, { icon: React.ReactNode; color: string; bg: string }> = {
  success: {
    icon: <CheckCircle size={20} />,
    color: colors.green,
    bg: `${colors.green}15`
  },
  error: {
    icon: <AlertCircle size={20} />,
    color: colors.red,
    bg: `${colors.red}15`
  },
  warning: {
    icon: <AlertTriangle size={20} />,
    color: colors.yellow,
    bg: `${colors.yellow}15`
  },
  info: {
    icon: <Info size={20} />,
    color: colors.blue,
    bg: `${colors.blue}15`
  }
};

export const SystemToast: React.FC<ToastProps> = ({
  variant = 'info',
  message,
  description,
  duration = 5000,
  onClose,
  show = true
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [isExiting, setIsExiting] = useState(false);
  const config = variantConfig[variant];

  useEffect(() => {
    setIsVisible(show);
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 flex items-start gap-3
        transition-all duration-300 ease-in-out
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
      style={{
        backgroundColor: colors.base02,
        border: `2px solid ${config.color}`,
        borderRadius: borderRadius.xl,
        padding: spacing[4],
        maxWidth: '400px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <div style={{ color: config.color, flexShrink: 0 }}>
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="font-semibold"
          style={{
            color: colors.base1,
            fontSize: fontSize.base,
            marginBottom: description ? spacing[1] : 0
          }}
        >
          {message}
        </div>
        {description && (
          <div
            style={{
              color: colors.base01,
              fontSize: fontSize.sm
            }}
          >
            {description}
          </div>
        )}
      </div>
      <button
        onClick={handleClose}
        className="transition-colors duration-200 hover:opacity-70 flex-shrink-0"
        style={{ color: colors.base01 }}
      >
        <X size={18} />
      </button>
    </div>
  );
};

// Toast context and hook for global toast management
interface ToastContextValue {
  showToast: (toast: Omit<ToastProps, 'show'>) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);

  const showToast = (toast: Omit<ToastProps, 'show'>) => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { ...toast, id, show: true }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
        {toasts.map((toast, index) => (
          <SystemToast
            key={toast.id}
            {...toast}
            onClose={() => {
              toast.onClose?.();
              removeToast(toast.id);
            }}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export default SystemToast;
