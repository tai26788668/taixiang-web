import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { LeaveApplication } from '../LeaveApplication';
import { AuthContext } from '../../../hooks/useAuth';
import { api } from '../../../services/api';
import i18n from '../../../i18n';
import { User } from '../../../types';

// Mock the API
vi.mock('../../../services/api');
const mockedApi = vi.mocked(api);

// Mock user for testing
const mockUser: User = {
  employeeId: 'EMP001',
  name: '測試員工',
  permission: 'employee'
};

// Mock auth context
const mockAuthContext = {
  user: mockUser,
  token: 'mock-token',
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn()
};

// Wrapper component for testing
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <I18nextProvider i18n={i18n}>
    <AuthContext.Provider value={mockAuthContext}>
      {children}
    </AuthContext.Provider>
  </I18nextProvider>
);

describe('Leave Application API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should successfully submit leave application and show success message', async () => {
    // Mock successful API responses
    mockedApi.post.mockImplementation((url) => {
      if (url === '/leave/calculate-hours') {
        return Promise.resolve({
          data: {
            success: true,
            data: { leaveHours: 8 }
          }
        });
      }
      if (url === '/leave/apply') {
        return Promise.resolve({
          data: {
            success: true,
            data: { recordId: 'REC001', leaveHours: 8 },
            message: '請假申請提交成功'
          }
        });
      }
      return Promise.reject(new Error('Unexpected API call'));
    });

    render(<LeaveApplication />, { wrapper: TestWrapper });

    // Fill in the form
    const leaveTypeSelect = screen.getByRole('combobox', { name: /假別/i });
    fireEvent.change(leaveTypeSelect, { target: { value: '事假' } });

    const startDateInput = screen.getByLabelText(/請假日期/i);
    fireEvent.change(startDateInput, { target: { value: '2024-06-15' } });

    const startTimeInput = screen.getByLabelText(/開始時間/i);
    fireEvent.change(startTimeInput, { target: { value: '09:00' } });

    // Note: LeaveApplication only has one date field (leaveDate), not separate end date

    const endTimeInput = screen.getByLabelText(/結束時間/i);
    fireEvent.change(endTimeInput, { target: { value: '17:00' } });

    const reasonTextarea = screen.getByLabelText(/事由/i);
    fireEvent.change(reasonTextarea, { target: { value: '個人事務' } });

    // Wait for hours calculation
    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith('/leave/calculate-hours', {
        startDate: '2024-06-15',
        startTime: '09:00',
        endDate: '2024-06-15',
        endTime: '17:00'
      });
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /提交申請/i });
    fireEvent.click(submitButton);

    // Wait for API call
    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith('/leave/apply', {
        leaveType: '事假',
        startDate: '2024-06-15',
        startTime: '09:00',
        endDate: '2024-06-15',
        endTime: '17:00',
        reason: '個人事務'
      });
    });

    // Success message should be displayed
    await waitFor(() => {
      expect(screen.getByText(/請假申請已成功提交/i)).toBeInTheDocument();
    });

    // Form should be reset after successful submission
    await waitFor(() => {
      expect((screen.getByLabelText(/請假日期/i) as HTMLInputElement).value).toBe('');
      expect((screen.getByLabelText(/開始時間/i) as HTMLInputElement).value).toBe('');
      // Note: No separate end date field in LeaveApplication
      expect((screen.getByLabelText(/結束時間/i) as HTMLInputElement).value).toBe('');
      expect((screen.getByLabelText(/事由/i) as HTMLTextAreaElement).value).toBe('');
    });
  });

  test('should handle API error and show error message', async () => {
    // Mock API error
    mockedApi.post.mockImplementation((url) => {
      if (url === '/leave/calculate-hours') {
        return Promise.resolve({
          data: {
            success: true,
            data: { leaveHours: 8 }
          }
        });
      }
      if (url === '/leave/apply') {
        return Promise.reject({
          response: {
            data: {
              success: false,
              message: '系統錯誤，請稍後再試'
            }
          }
        });
      }
      return Promise.reject(new Error('Unexpected API call'));
    });

    render(<LeaveApplication />, { wrapper: TestWrapper });

    // Fill in the form
    const leaveTypeSelect = screen.getByRole('combobox', { name: /假別/i });
    fireEvent.change(leaveTypeSelect, { target: { value: '病假' } });

    const startDateInput = screen.getByLabelText(/請假日期/i);
    fireEvent.change(startDateInput, { target: { value: '2024-06-16' } });

    const startTimeInput = screen.getByLabelText(/開始時間/i);
    fireEvent.change(startTimeInput, { target: { value: '08:00' } });

    // Note: LeaveApplication only has one date field (leaveDate), not separate end date

    const endTimeInput = screen.getByLabelText(/結束時間/i);
    fireEvent.change(endTimeInput, { target: { value: '12:00' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /提交申請/i });
    fireEvent.click(submitButton);

    // Error message should be displayed
    await waitFor(() => {
      expect(screen.getByText(/系統錯誤，請稍後再試/i)).toBeInTheDocument();
    });

    // Form should not be reset on error
    expect((screen.getByLabelText(/請假日期/i) as HTMLInputElement).value).toBe('2024-06-16');
    expect((screen.getByLabelText(/開始時間/i) as HTMLInputElement).value).toBe('08:00');
  });

  test('should calculate hours automatically when date/time fields change', async () => {
    // Mock hours calculation API
    mockedApi.post.mockImplementation((url) => {
      if (url === '/leave/calculate-hours') {
        return Promise.resolve({
          data: {
            success: true,
            data: { leaveHours: 4 }
          }
        });
      }
      return Promise.reject(new Error('Unexpected API call'));
    });

    render(<LeaveApplication />, { wrapper: TestWrapper });

    // Fill in date/time fields
    const startDateInput = screen.getByLabelText(/請假日期/i);
    fireEvent.change(startDateInput, { target: { value: '2024-06-17' } });

    const startTimeInput = screen.getByLabelText(/開始時間/i);
    fireEvent.change(startTimeInput, { target: { value: '13:00' } });

    // Note: LeaveApplication only has one date field (leaveDate), not separate end date

    const endTimeInput = screen.getByLabelText(/結束時間/i);
    fireEvent.change(endTimeInput, { target: { value: '17:00' } });

    // Wait for hours calculation API call
    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith('/leave/calculate-hours', {
        startDate: '2024-06-17',
        startTime: '13:00',
        endDate: '2024-06-17',
        endTime: '17:00'
      });
    });

    // Hours should be displayed
    await waitFor(() => {
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('小時')).toBeInTheDocument();
    });
  });

  test('should handle hours calculation error gracefully', async () => {
    // Mock hours calculation error
    mockedApi.post.mockImplementation((url) => {
      if (url === '/leave/calculate-hours') {
        return Promise.reject(new Error('計算錯誤'));
      }
      return Promise.reject(new Error('Unexpected API call'));
    });

    render(<LeaveApplication />, { wrapper: TestWrapper });

    // Fill in date/time fields
    const startDateInput = screen.getByLabelText(/請假日期/i);
    fireEvent.change(startDateInput, { target: { value: '2024-06-18' } });

    const startTimeInput = screen.getByLabelText(/開始時間/i);
    fireEvent.change(startTimeInput, { target: { value: '10:00' } });

    // Note: LeaveApplication only has one date field (leaveDate), not separate end date

    const endTimeInput = screen.getByLabelText(/結束時間/i);
    fireEvent.change(endTimeInput, { target: { value: '14:00' } });

    // Wait for API call attempt
    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith('/leave/calculate-hours', {
        startDate: '2024-06-18',
        startTime: '10:00',
        endDate: '2024-06-18',
        endTime: '14:00'
      });
    });

    // Hours should show 0 when calculation fails
    await waitFor(() => {
      // The hours display should not appear when calculation fails
      expect(screen.queryByText(/小時/)).not.toBeInTheDocument();
    });
  });

  test('should disable submit button during submission', async () => {
    // Mock slow API response
    mockedApi.post.mockImplementation((url) => {
      if (url === '/leave/calculate-hours') {
        return Promise.resolve({
          data: {
            success: true,
            data: { leaveHours: 8 }
          }
        });
      }
      if (url === '/leave/apply') {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              data: {
                success: true,
                data: { recordId: 'REC002', leaveHours: 8 },
                message: '請假申請提交成功'
              }
            });
          }, 100);
        });
      }
      return Promise.reject(new Error('Unexpected API call'));
    });

    render(<LeaveApplication />, { wrapper: TestWrapper });

    // Fill in the form
    const leaveTypeSelect = screen.getByRole('combobox', { name: /假別/i });
    fireEvent.change(leaveTypeSelect, { target: { value: '公假' } });

    const startDateInput = screen.getByLabelText(/請假日期/i);
    fireEvent.change(startDateInput, { target: { value: '2024-06-19' } });

    const startTimeInput = screen.getByLabelText(/開始時間/i);
    fireEvent.change(startTimeInput, { target: { value: '09:00' } });

    // Note: LeaveApplication only has one date field (leaveDate), not separate end date

    const endTimeInput = screen.getByLabelText(/結束時間/i);
    fireEvent.change(endTimeInput, { target: { value: '17:00' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /提交申請/i });
    fireEvent.click(submitButton);

    // Button should be disabled and show loading text
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/載入中/i)).toBeInTheDocument();

    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText(/請假申請已成功提交/i)).toBeInTheDocument();
    });

    // Button should be disabled again after form reset (since required fields are empty)
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/提交申請/i)).toBeInTheDocument();
    });
  });
});