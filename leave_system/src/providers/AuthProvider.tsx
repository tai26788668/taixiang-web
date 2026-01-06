import React, { useEffect } from 'react';
import { AuthContext, useAuthState } from '../hooks/useAuth';
import { useError } from './ErrorProvider';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const authState = useAuthState();
  const { showError } = useError();

  // 全域錯誤處理：監聽認證相關錯誤
  useEffect(() => {
    const handleAuthError = (event: CustomEvent) => {
      const { type } = event.detail;
      
      switch (type) {
        case 'session_invalid':
          showError('會話無效，請重新登入', '認證錯誤');
          break;
        default:
          console.warn('Unknown auth error type:', type);
      }
    };

    // 監聽自定義認證錯誤事件
    window.addEventListener('auth-error', handleAuthError as EventListener);

    return () => {
      window.removeEventListener('auth-error', handleAuthError as EventListener);
    };
  }, [showError]);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};