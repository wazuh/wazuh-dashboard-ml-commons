/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext, createContext, useState, useCallback, useEffect, useRef } from 'react';
import { Toast, EuiGlobalToastList } from '@elastic/eui';

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (toast: Toast) => void;
  addSuccessToast: (title: string, text?: string) => void;
  addErrorToast: (title: string, text?: string) => void;
  addWarningToast: (title: string, text?: string) => void;
  addInfoToast: (title: string, text?: string) => void;
}

const toastConfig = {
  lifeTimeMs: 6000,
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const newToast: Toast = {
      ...toast,
      id: `toast-${Date.now()}-${Math.random()}`,
    };
    if (isMountedRef.current) {
      setToasts((prevToasts) => [...prevToasts, newToast]);
    }
  }, []);

  const dismissToast = useCallback((removedToast: Toast) => {
    if (!isMountedRef.current) return;
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== removedToast.id));
  }, []);

  const addSuccessToast = useCallback(
    (title: string, text?: string) => {
      addToast({
        title,
        text,
        color: 'success',
        iconType: 'check',
      });
    },
    [addToast]
  );

  const addErrorToast = useCallback(
    (title: string, text?: string) => {
      addToast({
        title,
        text,
        color: 'danger',
        iconType: 'alert',
      });
    },
    [addToast]
  );

  const addWarningToast = useCallback(
    (title: string, text?: string) => {
      addToast({
        title,
        text,
        color: 'warning',
        iconType: 'warning',
      });
    },
    [addToast]
  );

  const addInfoToast = useCallback(
    (title: string, text?: string) => {
      addToast({
        title,
        text,
        color: 'primary',
        iconType: 'iInCircle',
      });
    },
    [addToast]
  );

  const value: ToastContextType = {
    toasts,
    addToast,
    dismissToast,
    addSuccessToast,
    addErrorToast,
    addWarningToast,
    addInfoToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <EuiGlobalToastList
        toasts={toasts}
        dismissToast={dismissToast}
        toastLifeTimeMs={toastConfig.lifeTimeMs}
      />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
