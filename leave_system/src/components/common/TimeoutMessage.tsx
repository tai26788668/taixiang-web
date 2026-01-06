import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { useLanguage } from '../../hooks/useLanguage';

export interface TimeoutMessageProps {
  /** 是否顯示超時訊息 */
  isVisible: boolean;
  /** 重新登入回調函數 */
  onRelogin: () => void;
  /** 自動跳轉延遲時間（秒），預設為3秒 */
  autoRedirectDelay?: number;
  /** 登出原因 */
  logoutReason?: string | null;
}

/**
 * 超時訊息組件
 * 顯示使用者閒置超時訊息，提供重新登入按鈕和自動跳轉功能
 */
export const TimeoutMessage: React.FC<TimeoutMessageProps> = ({
  isVisible,
  onRelogin,
  autoRedirectDelay = 3,
  logoutReason
}) => {
  const { t } = useLanguage();
  const [countdown, setCountdown] = useState(autoRedirectDelay);

  // 倒數計時效果
  useEffect(() => {
    if (!isVisible) {
      setCountdown(autoRedirectDelay);
      return;
    }

    // 開始倒數計時
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // 倒數結束，執行自動跳轉
          clearInterval(timer);
          onRelogin();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [isVisible, autoRedirectDelay, onRelogin]);

  // 重置倒數計時當組件重新顯示時
  useEffect(() => {
    if (isVisible) {
      setCountdown(autoRedirectDelay);
    }
  }, [isVisible, autoRedirectDelay]);

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="timeout-title"
        aria-describedby="timeout-description"
      >
        {/* 訊息對話框 */}
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 transform transition-all duration-300 ease-in-out">
          {/* 圖示 */}
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full">
            <svg 
              className="w-6 h-6 text-yellow-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>

          {/* 標題 */}
          <h2 
            id="timeout-title"
            className="text-lg font-semibold text-gray-900 text-center mb-2"
          >
            {t('autoLogout.sessionExpired')}
          </h2>

          {/* 主要訊息 */}
          <p 
            id="timeout-description"
            className="text-gray-600 text-center mb-4"
          >
            {logoutReason 
              ? `登出原因: ${logoutReason}`
              : t('autoLogout.timeoutMessage')
            }
          </p>

          {/* 倒數計時訊息 */}
          <p className="text-sm text-gray-500 text-center mb-6">
            {t('autoLogout.autoRedirectMessage', { seconds: countdown })}
          </p>

          {/* 按鈕區域 */}
          <div className="flex justify-center">
            <Button
              variant="primary"
              size="md"
              onClick={onRelogin}
              className="min-w-[120px]"
              autoFocus
            >
              {t('autoLogout.reloginButton')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};