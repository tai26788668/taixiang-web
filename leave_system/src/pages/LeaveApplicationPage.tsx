import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/common/Layout';
import { LeaveApplication } from '../components/leave/LeaveApplication';

export const LeaveApplicationPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('leave.application.title')}</h1>
        <LeaveApplication />
      </div>
    </Layout>
  );
};