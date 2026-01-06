import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/common/Layout';
import { LeaveManagement } from '../../components/leave/LeaveManagement';

export const LeaveManagementPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('leave.management.title')}</h1>
        <LeaveManagement />
      </div>
    </Layout>
  );
};