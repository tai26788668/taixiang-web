import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ErrorInfo {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  timestamp: number;
  autoHide?: boolean;
  duration?: number;
}

interface ErrorContextType {
  errors: ErrorInfo[];
  addError: (error: Omit<ErrorInfo, 'id' | 'timestamp'>) => string;
  removeError: (id: string) => void;
  clearErrors: () => void;
  showError: (message: string, title?: string) => string;
  showWarning: (message: string, title?: string) => string;
  showInfo: (message: string, title?: string) => string;
  showSuccess: (message: string, title?: string) => string;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addError = (errorData: Omit<ErrorInfo, 'id' | 'timestamp'>): string => {
    const id = generateId();
    const newError: ErrorInfo = {
      ...errorData,
      id,
      timestamp: Date.now(),
    };

    setErrors(prev => [...prev, newError]);

    // 自動隱藏錯誤訊息
    if (errorData.autoHide !== false) {
      const duration = errorData.duration || (errorData.type === 'success' ? 3000 : 5000);
      setTimeout(() => {
        removeError(id);
      }, duration);
    }

    return id;
  };

  const removeError = (id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const showError = (message: string, title?: string): string => {
    return addError({
      message,
      title,
      type: 'error',
      autoHide: false, // 錯誤訊息不自動隱藏
    });
  };

  const showWarning = (message: string, title?: string): string => {
    return addError({
      message,
      title,
      type: 'warning',
      autoHide: true,
      duration: 4000,
    });
  };

  const showInfo = (message: string, title?: string): string => {
    return addError({
      message,
      title,
      type: 'info',
      autoHide: true,
      duration: 4000,
    });
  };

  const showSuccess = (message: string, title?: string): string => {
    return addError({
      message,
      title,
      type: 'success',
      autoHide: true,
      duration: 3000,
    });
  };

  const value: ErrorContextType = {
    errors,
    addError,
    removeError,
    clearErrors,
    showError,
    showWarning,
    showInfo,
    showSuccess,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};