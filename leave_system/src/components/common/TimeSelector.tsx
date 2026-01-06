import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface TimeSelectorProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  error?: boolean;
  'aria-label'?: string;
  loading?: boolean;
  errorMessage?: string;
}

interface TimeOption {
  value: string;
  label: string;
}

// 時間選項生成邏輯
function generateTimeOptions(): TimeOption[] {
  try {
    const options: TimeOption[] = [];
    
    // 當日時間選項 (00:00 - 23:45)
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeValue = formatTime(hour, minute);
        options.push({
          value: timeValue,
          label: timeValue
        });
      }
    }
    
    // 隔日早上時間選項 (00:00(+1) - 07:00(+1))
    for (let hour = 0; hour <= 7; hour++) {
      const endMinute = hour === 7 ? 1 : 60; // 07:00(+1) 為最後一個選項，所以需要包含minute=0
      for (let minute = 0; minute < endMinute; minute += 15) {
        const timeValue = formatTime(hour, minute);
        const label = `${timeValue}(+1)`;
        options.push({
          value: `${timeValue}(+1)`,
          label: label
        });
      }
    }
    
    // 驗證生成的選項數量
    if (options.length !== 125) {
      throw new Error(`時間選項數量不正確: 期望 125 個，實際 ${options.length} 個`);
    }
    
    return options; // 總共 96 + 29 = 125 個選項
  } catch (error) {
    console.error('時間選項生成失敗:', error);
    // 返回基本的時間選項作為降級
    return generateFallbackTimeOptions();
  }
}

// 降級時間選項生成（僅當日時間）
function generateFallbackTimeOptions(): TimeOption[] {
  const options: TimeOption[] = [];
  
  try {
    // 僅生成當日時間選項
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeValue = formatTime(hour, minute);
        options.push({
          value: timeValue,
          label: timeValue
        });
      }
    }
  } catch (error) {
    console.error('降級時間選項生成也失敗:', error);
    // 最基本的選項
    return [
      { value: '09:00', label: '09:00' },
      { value: '17:00', label: '17:00' }
    ];
  }
  
  return options;
}

function formatTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

export const TimeSelector: React.FC<TimeSelectorProps> = ({
  id,
  name,
  value,
  onChange,
  className = '',
  disabled = false,
  placeholder,
  error = false,
  loading = false,
  errorMessage,
  'aria-label': ariaLabel
}) => {
  const { t } = useTranslation();
  
  // 使用翻譯的預設 placeholder
  const defaultPlaceholder = placeholder || t('leave.application.selectTime');
  // 狀態管理
  const [timeOptions, setTimeOptions] = useState<TimeOption[]>([]);
  const [hasError, setHasError] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [keyboardBuffer, setKeyboardBuffer] = useState('');
  const keyboardTimeoutRef = useRef<NodeJS.Timeout>();

  // 初始化時間選項
  useEffect(() => {
    const initializeOptions = () => {
      try {
        const options = generateTimeOptions();
        setTimeOptions(options);
        setIsInitialized(true);
        setHasError(false);
      } catch (error) {
        console.error('TimeSelector 初始化失敗:', error);
        setHasError(true);
        
        // 使用降級選項
        const fallbackOptions = generateFallbackTimeOptions();
        setTimeOptions(fallbackOptions);
        setIsInitialized(true);
      }
    };

    initializeOptions();
  }, []);

  // Keyboard navigation for quick time selection
  const handleKeyboardNavigation = useCallback((key: string) => {
    if (!/[0-9:]/.test(key)) return;

    // Clear previous timeout
    if (keyboardTimeoutRef.current) {
      clearTimeout(keyboardTimeoutRef.current);
    }

    const newBuffer = keyboardBuffer + key;
    setKeyboardBuffer(newBuffer);

    // Find matching time option
    const matchingOption = timeOptions.find(option => 
      option.value.startsWith(newBuffer) || 
      option.value.replace('(+1)', '').startsWith(newBuffer)
    );

    if (matchingOption && selectRef.current) {
      selectRef.current.value = matchingOption.value;
      // Trigger onChange event with proper typing
      const syntheticEvent = {
        target: selectRef.current,
        currentTarget: selectRef.current,
        nativeEvent: new Event('change', { bubbles: true }),
        isDefaultPrevented: () => false,
        isPropagationStopped: () => false,
        persist: () => {},
        preventDefault: () => {},
        stopPropagation: () => {},
        bubbles: true,
        cancelable: true,
        defaultPrevented: false,
        eventPhase: 0,
        isTrusted: true,
        timeStamp: Date.now(),
        type: 'change'
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange(syntheticEvent);
    }

    // Clear buffer after 1 second of inactivity
    keyboardTimeoutRef.current = setTimeout(() => {
      setKeyboardBuffer('');
    }, 1000);
  }, [keyboardBuffer, timeOptions, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSelectElement>) => {
    // Handle keyboard navigation
    if (e.key.match(/[0-9:]/)) {
      e.preventDefault();
      handleKeyboardNavigation(e.key);
    }
    // Clear buffer on Escape
    else if (e.key === 'Escape') {
      setKeyboardBuffer('');
      if (keyboardTimeoutRef.current) {
        clearTimeout(keyboardTimeoutRef.current);
      }
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setKeyboardBuffer('');
    if (keyboardTimeoutRef.current) {
      clearTimeout(keyboardTimeoutRef.current);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Pass through the event directly to maintain compatibility
    onChange(e);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (keyboardTimeoutRef.current) {
        clearTimeout(keyboardTimeoutRef.current);
      }
    };
  }, []);

  // 如果尚未初始化，顯示載入狀態
  if (!isInitialized) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-md bg-gray-50">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-gray-500">{t('leave.application.initializingTimeSelector')}</span>
          </div>
        </div>
      </div>
    );
  }

  // 如果有錯誤且沒有選項，顯示錯誤狀態
  if (hasError && timeOptions.length === 0) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm text-red-700">{t('leave.application.timeSelectorLoadFailed')}</span>
          </div>
        </div>
      </div>
    );
  }

  // Base classes for consistent styling
  const baseClasses = `
    w-full px-3 py-2 pr-10 text-sm border rounded-md
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
    transition-colors duration-200
    ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
    ${isFocused ? 'ring-2 ring-blue-500 border-blue-500' : ''}
    ${loading ? 'bg-gray-50' : 'bg-white'}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Mobile-optimized classes
  const mobileClasses = `
    touch-manipulation
    text-base
    min-h-[44px]
    sm:text-sm sm:min-h-[38px]
  `;

  return (
    <div className="relative">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-md">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      <select
        ref={selectRef}
        id={id}
        name={name}
        value={value}
        onChange={handleTimeChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`${baseClasses} ${mobileClasses}`}
        disabled={disabled || loading}
        aria-label={ariaLabel || t('leave.application.selectTime')}
        aria-describedby={
          error && errorMessage ? `${id}-error` : 
          keyboardBuffer ? `${id}-keyboard-hint` : undefined
        }
        aria-invalid={error}
        role="combobox"
        aria-expanded="false"
        aria-haspopup="listbox"
      >
        {defaultPlaceholder && (
          <option value="" disabled>
            {defaultPlaceholder}
          </option>
        )}
        {timeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Icon container */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
        ) : (
          <svg 
            className={`w-4 h-4 transition-colors ${error ? 'text-red-400' : 'text-gray-400'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>

      {/* Keyboard navigation hint */}
      {keyboardBuffer && (
        <div 
          id={`${id}-keyboard-hint`}
          className="absolute top-full left-0 mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg z-20"
          role="status"
          aria-live="polite"
        >
          {t('leave.application.typing')}: {keyboardBuffer}
        </div>
      )}

      {/* Error message */}
      {error && errorMessage && (
        <div 
          id={`${id}-error`}
          className="mt-1 text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {errorMessage}
        </div>
      )}

      {/* Screen reader instructions */}
      <div className="sr-only" aria-live="polite">
        {t('leave.application.keyboardInstructions')}
      </div>
    </div>
  );
};

// 導出工具函數供其他組件使用
export { generateTimeOptions, formatTime };