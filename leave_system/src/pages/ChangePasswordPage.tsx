import React from 'react';
import { Header } from '../components/common/Header';
import { ChangePassword } from '../components/user/ChangePassword';
import { useLanguage } from '../hooks/useLanguage';

export const ChangePasswordPage: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('changePassword.title')}</h1>
          <ChangePassword />
        </div>
      </main>
    </div>
  );
};