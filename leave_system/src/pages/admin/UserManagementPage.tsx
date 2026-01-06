import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/common/Layout';
import { UserManagement } from '../../components/admin/UserManagement';

export const UserManagementPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('nav.userManagement')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('userManagement.description', '管理系統使用者帳號和權限')}
          </p>
        </div>
        
        <UserManagement />
      </div>
    </Layout>
  );
};