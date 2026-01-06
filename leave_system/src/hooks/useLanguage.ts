import { useTranslation } from 'react-i18next';
import { Language } from '../types';

export const useLanguage = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (language: Language) => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  };

  return {
    language: i18n.language as Language,
    changeLanguage,
    t,
  };
};