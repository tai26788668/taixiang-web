import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import zhTW from './zh-TW.json';
import enUS from './en-US.json';
import idID from './id-ID.json';

// 語言資源
const resources = {
  'zh-TW': {
    translation: zhTW,
  },
  'en-US': {
    translation: enUS,
  },
  'id-ID': {
    translation: idID,
  },
};

// 初始化 i18next
i18n
  .use(LanguageDetector) // 語言偵測
  .use(initReactI18next) // 綁定 react-i18next
  .init({
    resources,
    lng: 'zh-TW', // 預設語言
    fallbackLng: 'zh-TW', // 備用語言
    
    interpolation: {
      escapeValue: false, // React 已經處理 XSS 防護
    },
    
    // 偵測語言設定
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'language',
    },
    
    // 錯誤處理
    saveMissing: false,
    missingKeyHandler: (lng, _ns, key) => {
      console.warn(`Missing translation key: ${key} for language: ${lng}`);
    },
    
    // 確保初始化完成
    initImmediate: false,
  })
  .catch((error) => {
    console.error('i18n initialization error:', error);
  });

export default i18n;