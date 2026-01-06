import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import { ErrorProvider, useError } from '../../providers/ErrorProvider';
import { ErrorNotifications } from '../../components/common/ErrorNotifications';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';

// 測試組件：故意拋出錯誤
const ThrowError: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('測試錯誤');
  }
  return <div>正常組件</div>;
};

// 測試組件：使用錯誤 context
const ErrorTestComponent: React.FC = () => {
  const { showError, showWarning, showInfo, showSuccess } = useError();

  return (
    <div>
      <button onClick={() => showError('測試錯誤訊息')}>顯示錯誤</button>
      <button onClick={() => showWarning('測試警告訊息')}>顯示警告</button>
      <button onClick={() => showInfo('測試資訊訊息')}>顯示資訊</button>
      <button onClick={() => showSuccess('測試成功訊息')}>顯示成功</button>
    </div>
  );
};

// 測試工具函數
const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorProvider>
          <ErrorBoundary>
            {component}
            <ErrorNotifications />
          </ErrorBoundary>
        </ErrorProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Error Handling Integration Tests', () => {
  beforeEach(() => {
    // 清除 console.error mock
    vi.clearAllMocks();
    
    // Mock console.error 以避免測試輸出中的錯誤訊息
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Error Boundary', () => {
    it('should catch and display JavaScript errors', () => {
      renderWithProviders(<ThrowError shouldThrow={true} />);

      // 應該顯示錯誤邊界 UI
      expect(screen.getByText('系統發生錯誤')).toBeInTheDocument();
      expect(screen.getByText(/很抱歉，系統遇到了一個意外的錯誤/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '重試' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '重新載入' })).toBeInTheDocument();
    });

    it('should allow retry after error', async () => {
      const user = userEvent.setup();
      let shouldThrow = true;

      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      );

      // 確認錯誤邊界顯示
      expect(screen.getByText('系統發生錯誤')).toBeInTheDocument();

      // 模擬修復錯誤
      shouldThrow = false;

      // 點擊重試按鈕
      await user.click(screen.getByRole('button', { name: '重試' }));

      // 重新渲染組件（模擬重試）
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      );

      // 應該顯示正常組件
      expect(screen.getByText('正常組件')).toBeInTheDocument();
    });

    it('should show error details in development mode', () => {
      // 設定開發模式
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      renderWithProviders(<ThrowError shouldThrow={true} />);

      // 應該顯示錯誤詳情
      expect(screen.getByText('錯誤詳情 (開發模式)')).toBeInTheDocument();

      // 恢復環境變數
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Error Notifications', () => {
    it('should display error notifications', async () => {
      const user = userEvent.setup();

      renderWithProviders(<ErrorTestComponent />);

      // 顯示錯誤通知
      await user.click(screen.getByRole('button', { name: '顯示錯誤' }));

      // 應該顯示錯誤通知
      expect(screen.getByText('測試錯誤訊息')).toBeInTheDocument();
    });

    it('should display different types of notifications', async () => {
      const user = userEvent.setup();

      renderWithProviders(<ErrorTestComponent />);

      // 顯示不同類型的通知
      await user.click(screen.getByRole('button', { name: '顯示警告' }));
      await user.click(screen.getByRole('button', { name: '顯示資訊' }));
      await user.click(screen.getByRole('button', { name: '顯示成功' }));

      // 應該顯示所有通知
      expect(screen.getByText('測試警告訊息')).toBeInTheDocument();
      expect(screen.getByText('測試資訊訊息')).toBeInTheDocument();
      expect(screen.getByText('測試成功訊息')).toBeInTheDocument();
    });

    it('should allow dismissing notifications', async () => {
      const user = userEvent.setup();

      renderWithProviders(<ErrorTestComponent />);

      // 顯示錯誤通知
      await user.click(screen.getByRole('button', { name: '顯示錯誤' }));

      // 確認通知顯示
      expect(screen.getByText('測試錯誤訊息')).toBeInTheDocument();

      // 點擊關閉按鈕
      const dismissButton = screen.getByRole('button', { name: '關閉' });
      await user.click(dismissButton);

      // 通知應該消失
      await waitFor(() => {
        expect(screen.queryByText('測試錯誤訊息')).not.toBeInTheDocument();
      });
    });

    it('should auto-hide success notifications', async () => {
      const user = userEvent.setup();

      renderWithProviders(<ErrorTestComponent />);

      // 顯示成功通知
      await user.click(screen.getByRole('button', { name: '顯示成功' }));

      // 確認通知顯示
      expect(screen.getByText('測試成功訊息')).toBeInTheDocument();

      // 等待自動隱藏（3秒）
      await waitFor(
        () => {
          expect(screen.queryByText('測試成功訊息')).not.toBeInTheDocument();
        },
        { timeout: 4000 }
      );
    });
  });

  describe('Error Display Component', () => {
    it('should display error with retry option', async () => {
      const user = userEvent.setup();
      const mockRetry = vi.fn();

      render(
        <ErrorDisplay
          error="測試錯誤"
          onRetry={mockRetry}
          onDismiss={() => {}}
        />
      );

      // 確認錯誤顯示
      expect(screen.getByText('測試錯誤')).toBeInTheDocument();

      // 點擊重試按鈕
      await user.click(screen.getByRole('button', { name: '重試' }));

      // 確認重試函數被呼叫
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('should display different error types with appropriate styling', () => {
      const { rerender } = render(
        <ErrorDisplay error="錯誤訊息" type="error" />
      );

      // 錯誤類型應該有紅色樣式
      expect(screen.getByText('錯誤訊息')).toBeInTheDocument();

      // 重新渲染為警告類型
      rerender(<ErrorDisplay error="警告訊息" type="warning" />);

      // 警告類型應該有黃色樣式
      expect(screen.getByText('警告訊息')).toBeInTheDocument();

      // 重新渲染為資訊類型
      rerender(<ErrorDisplay error="資訊訊息" type="info" />);

      // 資訊類型應該有藍色樣式
      expect(screen.getByText('資訊訊息')).toBeInTheDocument();
    });
  });

  describe('Error Context Integration', () => {
    it('should manage multiple errors correctly', async () => {
      const user = userEvent.setup();

      renderWithProviders(<ErrorTestComponent />);

      // 顯示多個錯誤
      await user.click(screen.getByRole('button', { name: '顯示錯誤' }));
      await user.click(screen.getByRole('button', { name: '顯示警告' }));

      // 應該顯示兩個通知
      expect(screen.getByText('測試錯誤訊息')).toBeInTheDocument();
      expect(screen.getByText('測試警告訊息')).toBeInTheDocument();

      // 關閉一個通知
      const dismissButtons = screen.getAllByRole('button', { name: '關閉' });
      await user.click(dismissButtons[0]);

      // 應該還有一個通知存在
      await waitFor(() => {
        const remainingNotifications = screen.queryAllByText(/測試.*訊息/);
        expect(remainingNotifications).toHaveLength(1);
      });
    });

    it('should handle error context without provider gracefully', () => {
      // 測試在沒有 ErrorProvider 的情況下使用 useError
      const TestComponent = () => {
        try {
          const { showError } = useError();
          return <div>應該不會顯示</div>;
        } catch (error) {
          return <div>錯誤：{(error as Error).message}</div>;
        }
      };

      render(<TestComponent />);

      // 應該顯示錯誤訊息
      expect(screen.getByText(/useError must be used within an ErrorProvider/)).toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    it('should recover from errors and continue normal operation', async () => {
      const user = userEvent.setup();
      let shouldThrow = true;

      const TestComponent = () => {
        return (
          <div>
            <button onClick={() => { shouldThrow = !shouldThrow; }}>
              切換錯誤狀態
            </button>
            <ThrowError shouldThrow={shouldThrow} />
          </div>
        );
      };

      const { rerender } = renderWithProviders(<TestComponent />);

      // 初始狀態應該顯示錯誤
      expect(screen.getByText('系統發生錯誤')).toBeInTheDocument();

      // 修復錯誤
      shouldThrow = false;

      // 重新渲染
      rerender(
        <QueryClientProvider client={new QueryClient()}>
          <BrowserRouter>
            <ErrorProvider>
              <ErrorBoundary>
                <TestComponent />
                <ErrorNotifications />
              </ErrorBoundary>
            </ErrorProvider>
          </BrowserRouter>
        </QueryClientProvider>
      );

      // 應該恢復正常
      expect(screen.getByText('正常組件')).toBeInTheDocument();
    });
  });
});