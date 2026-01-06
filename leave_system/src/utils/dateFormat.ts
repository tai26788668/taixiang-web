import i18n from '../i18n';

/**
 * 根據當前語言設定格式化日期
 * @param dateString - 日期字串 (YYYY-MM-DD 格式)
 * @param options - 格式化選項
 * @returns 格式化後的日期字串
 */
export const formatDate = (
  dateString: string, 
  options: Intl.DateTimeFormatOptions = {}
): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const currentLanguage = i18n.language || 'zh-TW';
    
    // 根據語言設定預設格式
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      ...options
    };
    
    // 語言對應的locale設定
    const localeMap: Record<string, string> = {
      'zh-TW': 'zh-TW',
      'en-US': 'en-US',
      'id-ID': 'id-ID'
    };
    
    const locale = localeMap[currentLanguage] || 'zh-TW';
    
    return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateString;
  }
};

/**
 * 根據當前語言設定格式化時間
 * @param timeString - 時間字串 (HH:MM 或 HH:MM(+1) 格式)
 * @returns 格式化後的時間字串
 */
export const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  
  // 處理隔日時間標記
  const isNextDay = timeString.includes('(+1)');
  const cleanTime = timeString.replace('(+1)', '');
  
  try {
    // 驗證時間格式
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(cleanTime)) {
      return timeString; // 如果格式不正確，返回原始字串
    }
    
    const [hours, minutes] = cleanTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    const currentLanguage = i18n.language || 'zh-TW';
    
    // 語言對應的locale設定
    const localeMap: Record<string, string> = {
      'zh-TW': 'zh-TW',
      'en-US': 'en-US',
      'id-ID': 'id-ID'
    };
    
    const locale = localeMap[currentLanguage] || 'zh-TW';
    
    // 使用24小時制格式
    const formattedTime = new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
    
    // 加回隔日標記
    return isNextDay ? `${formattedTime}(+1)` : formattedTime;
  } catch (error) {
    console.error('Time formatting error:', error);
    return timeString;
  }
};

/**
 * 根據當前語言設定格式化日期時間
 * @param dateString - 日期字串 (YYYY-MM-DD 格式)
 * @param timeString - 時間字串 (HH:MM 或 HH:MM(+1) 格式)
 * @returns 格式化後的日期時間字串
 */
export const formatDateTime = (dateString: string, timeString: string): string => {
  if (!dateString || !timeString) return 'undefined';
  
  const formattedDate = formatDate(dateString);
  const formattedTime = formatTime(timeString);
  
  return `${formattedDate} ${formattedTime}`;
};

/**
 * 格式化申請日期時間 (ISO 格式)
 * @param dateTimeString - ISO 日期時間字串
 * @returns 格式化後的日期時間字串
 */
export const formatApplicationDateTime = (dateTimeString: string): string => {
  if (!dateTimeString) return '';
  
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return dateTimeString;
    
    const currentLanguage = i18n.language || 'zh-TW';
    
    // 語言對應的locale設定
    const localeMap: Record<string, string> = {
      'zh-TW': 'zh-TW',
      'en-US': 'en-US',
      'id-ID': 'id-ID'
    };
    
    const locale = localeMap[currentLanguage] || 'zh-TW';
    
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);
  } catch (error) {
    console.error('Application date time formatting error:', error);
    return dateTimeString.replace('T', ' ').substring(0, 19);
  }
};