import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useError } from '../../providers/ErrorProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { t } = useTranslation();
  const { isAuthenticated, user, isLoading } = useAuth();
  const { showWarning } = useError();
  const location = useLocation();

  // 檢查會話有效性和自動登出狀態
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      // 檢查是否有登出原因（來自自動登出）
      const logoutReason = sessionStorage.getItem('logout_reason');
      if (logoutReason) {
        sessionStorage.removeItem('logout_reason');
        
        switch (logoutReason) {
          case 'timeout':
            showWarning('由於閒置時間過長，您已被自動登出', '會話過期');
            break;
          case 'security':
            showWarning('基於安全考量，您已被登出', '安全登出');
            break;
          default:
            console.log('User logged out:', logoutReason);
        }
      }

      // 驗證會話完整性
      const token = sessionStorage.getItem('auth_token');
      const userData = sessionStorage.getItem('user_data');
      
      if (!token || !userData) {
        console.warn('Session data incomplete, potential security issue');
        // 觸發自定義事件通知認證錯誤
        window.dispatchEvent(new CustomEvent('auth-error', {
          detail: { type: 'session_invalid', message: '會話資料不完整' }
        }));
      }

      // 記錄路由保護狀態
      console.log('Protected route accessed:', {
        path: location.pathname,
        user: user.employeeId,
        requireAdmin
      });
    }
  }, [isAuthenticated, user, isLoading, location.pathname, requireAdmin, showWarning]);

  // 載入中時顯示載入畫面
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">{t('common.loading')}</div>
      </div>
    );
  }

  // 未驗證使用者重導向到登入頁面
  if (!isAuthenticated || !user) {
    // 記錄未授權存取嘗試
    console.log('Unauthorized access attempt:', {
      path: location.pathname,
      isAuthenticated,
      hasUser: !!user
    });
    
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 需要管理者權限但使用者不是管理者
  if (requireAdmin && user.permission !== 'admin') {
    console.warn('Admin access denied:', {
      user: user.employeeId,
      permission: user.permission,
      path: location.pathname
    });
    
    // 觸發權限錯誤事件
    window.dispatchEvent(new CustomEvent('auth-error', {
      detail: { 
        type: 'permission_denied', 
        message: '您沒有存取此頁面的權限' 
      }
    }));
    
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};