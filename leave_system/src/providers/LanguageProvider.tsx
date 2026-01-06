import React, { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  useEffect(() => {
    // 從本地存儲載入語言設定
    try {
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage && (savedLanguage === 'zh-TW' || savedLanguage === 'en-US' || savedLanguage === 'id-ID')) {
        i18n.changeLanguage(savedLanguage).catch((error) => {
          console.error('Failed to change language:', error);
        });
      }
    } catch (error) {
      console.error('Error loading language from localStorage:', error);
    }
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
};