import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/common/Layout';
import { LeaveRecord } from '../components/leave/LeaveRecord';

export const LeaveRecordPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('leave.records.title')}</h1>
        <LeaveRecord />
      </div>
    </Layout>
  );
};