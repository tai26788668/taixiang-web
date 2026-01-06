import React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoginForm } from '../components/auth/LoginForm';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log('LoginPage render:', { isAuthenticated, isLoading, user });

  // 載入中時顯示載入畫面
  if (isLoading) {
    console.log('LoginPage: showing loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">載入中...</div>
      </div>
    );
  }

  // 如果已經登入，重導向到請假申請頁面
  if (isAuthenticated) {
    console.log('LoginPage: redirecting to /leave/application');
    return <Navigate to="/leave/application" replace />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('system.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('auth.pleaseLogin')}
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};