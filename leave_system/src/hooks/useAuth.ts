import { useState, useEffect, createContext, useContext } from 'react';
import { AuthState, LoginFormData } from '../types';
import { api } from '../services/api';

interface AuthContextType extends AuthState {
  login: (credentials: LoginFormData) => Promise<void>;
  logout: (reason?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthState = (): AuthContextType => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // 初始化時檢查會話存儲的 token (瀏覽器關閉後會清除)
  useEffect(() => {
    const token = sessionStorage.getItem('auth_token');
    const userData = sessionStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        // 如果解析失敗，清除無效資料
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('user_data');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (credentials: LoginFormData): Promise<void> => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.success && response.data.data) {
        const { token, user } = response.data.data;
        
        // 確保 permission 是正確的類型
        const typedUser = {
          ...user,
          permission: user.permission as 'employee' | 'admin'
        };
        
        // 儲存到會話存儲 (瀏覽器關閉後會清除)
        sessionStorage.setItem('auth_token', token);
        sessionStorage.setItem('user_data', JSON.stringify(typedUser));
        
        // 更新狀態
        const newAuthState = {
          user: typedUser,
          token,
          isAuthenticated: true,
          isLoading: false,
        };
        console.log('Setting auth state:', newAuthState);
        setAuthState(newAuthState);
      } else {
        throw new Error(response.data.message || '登入失敗');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = (reason?: string): void => {
    console.log('Logging out', reason ? `(reason: ${reason})` : '');
    
    // 清除會話存儲
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user_data');
    
    // 清除本地存儲中的任何敏感資料
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    sessionStorage.removeItem('temp_auth_data');
    sessionStorage.removeItem('user_preferences');
    
    // 重置狀態
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    
    // 觸發自定義登出事件供其他組件監聽
    window.dispatchEvent(new CustomEvent('user-logout', {
      detail: { reason: reason || 'manual' }
    }));
  };

  return {
    ...authState,
    login,
    logout,
  };
};

export { AuthContext };