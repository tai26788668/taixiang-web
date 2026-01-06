import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import * as fc from 'fast-check';
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

describe('Leave Application Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful hours calculation
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
            data: { recordId: 'test-id', leaveHours: 8 },
            message: '請假申請提交成功'
          }
        });
      }
      return Promise.reject(new Error('Unexpected API call'));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * **Feature: employee-leave-system, Property 5: 請假申請表單初始化**
   * **Validates: Requirements 2.1**
   * 
   * 對於任何已驗證的員工存取請假申請頁面，系統應該自動填入工號和姓名並設為不可編輯
   */
  test('Property 5: Leave application form should auto-fill employee ID and name as read-only', () => {
    fc.assert(
      fc.property(
        // Generate different user data with alphanumeric characters only
        fc.record({
          employeeId: fc.string({ minLength: 3, maxLength: 10 }).filter(s => /^[A-Za-z0-9]+$/.test(s)),
          name: fc.string({ minLength: 2, maxLength: 20 }).filter(s => /^[A-Za-z\u4e00-\u9fff\s]+$/.test(s.trim()) && s.trim().length > 0),
          permission: fc.constantFrom('employee', 'admin')
        }),
        (userData) => {
          const testAuthContext = {
            ...mockAuthContext,
            user: {
              ...userData,
              permission: userData.permission as 'employee' | 'admin'
            }
          };

          const TestWrapperWithUser: React.FC<{ children: React.ReactNode }> = ({ children }) => (
            <I18nextProvider i18n={i18n}>
              <AuthContext.Provider value={testAuthContext}>
                {children}
              </AuthContext.Provider>
            </I18nextProvider>
          );

          const { container } = render(<LeaveApplication />, { wrapper: TestWrapperWithUser });

          // Employee ID field should be auto-filled and disabled
          const employeeIdInput = container.querySelector('#employeeId') as HTMLInputElement;
          expect(employeeIdInput).toBeInTheDocument();
          expect(employeeIdInput.value).toBe(userData.employeeId);
          expect(employeeIdInput).toBeDisabled();

          // Name field should be auto-filled and disabled
          const nameInput = container.querySelector('#name') as HTMLInputElement;
          expect(nameInput).toBeInTheDocument();
          expect(nameInput.value).toBe(userData.name);
          expect(nameInput).toBeDisabled();
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * **Feature: employee-leave-system, Property 6: 請假申請完整流程**
   * **Validates: Requirements 2.2, 2.3, 2.4**
   * 
   * 對於任何有效的請假申請，系統應該驗證必填欄位、設定申請時間和簽核狀態、儲存到CSV並顯示完成訊息
   */
  test('Property 6: Complete leave application flow should validate, submit, and show success', async () => {
    fc.assert(
      fc.asyncProperty(
        // Generate valid leave application data
        fc.record({
          leaveType: fc.constantFrom('事假', '公假', '喪假', '病假', '特休', '生理假'),
          startDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') })
            .map(d => d.toISOString().split('T')[0]), // YYYY-MM-DD format
          startTime: fc.integer({ min: 8, max: 17 }).map(h => `${h.toString().padStart(2, '0')}:00`),
          endDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') })
            .map(d => d.toISOString().split('T')[0]),
          endTime: fc.integer({ min: 9, max: 18 }).map(h => `${h.toString().padStart(2, '0')}:00`),
          reason: fc.option(fc.string({ minLength: 0, maxLength: 100 }), { nil: '' })
        }).filter(data => {
          // Ensure end date/time is after start date/time
          const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
          const endDateTime = new Date(`${data.endDate}T${data.endTime}`);
          return endDateTime > startDateTime;
        }),
        async (formData) => {
          render(<LeaveApplication />, { wrapper: TestWrapper });

          // Fill in the form
          const leaveTypeSelect = screen.getByRole('combobox', { name: /假別/i });
          fireEvent.change(leaveTypeSelect, { target: { value: formData.leaveType } });

          const startDateInput = screen.getByLabelText(/請假日期/i);
          fireEvent.change(startDateInput, { target: { value: formData.startDate } });

          const startTimeInput = screen.getByLabelText(/開始時間/i);
          fireEvent.change(startTimeInput, { target: { value: formData.startTime } });

          // Note: LeaveApplication only has one date field (leaveDate), not separate start/end dates

          const endTimeInput = screen.getByLabelText(/結束時間/i);
          fireEvent.change(endTimeInput, { target: { value: formData.endTime } });

          if (formData.reason) {
            const reasonTextarea = screen.getByLabelText(/事由/i);
            fireEvent.change(reasonTextarea, { target: { value: formData.reason } });
          }

          // Wait for hours calculation
          await waitFor(() => {
            expect(mockedApi.post).toHaveBeenCalledWith('/leave/calculate-hours', {
              startDate: formData.startDate,
              startTime: formData.startTime,
              endDate: formData.endDate,
              endTime: formData.endTime
            });
          });

          // Submit button should be enabled when all required fields are filled
          const submitButton = screen.getByRole('button', { name: /提交申請/i });
          expect(submitButton).not.toBeDisabled();

          // Submit the form
          fireEvent.click(submitButton);

          // Wait for API call and success message
          await waitFor(() => {
            expect(mockedApi.post).toHaveBeenCalledWith('/leave/apply', {
              leaveType: formData.leaveType,
              startDate: formData.startDate,
              startTime: formData.startTime,
              endDate: formData.endDate,
              endTime: formData.endTime,
              reason: formData.reason || ''
            });
          });

          // Success message should be displayed
          await waitFor(() => {
            expect(screen.getByText(/請假申請已成功提交/i)).toBeInTheDocument();
          });
        }
      ),
      { numRuns: 5 }
    );
  });

  /**
   * Property 6 (Form Validation): Required field validation should work correctly
   */
  test('Property 6 (Validation): Submit button should be disabled when required fields are missing', () => {
    fc.assert(
      fc.property(
        // Generate incomplete form data (missing some required fields)
        fc.record({
          leaveType: fc.option(fc.constantFrom('事假', '公假', '喪假', '病假', '特休', '生理假')),
          startDate: fc.option(fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') })
            .map(d => d.toISOString().split('T')[0])),
          startTime: fc.option(fc.integer({ min: 8, max: 17 }).map(h => `${h.toString().padStart(2, '0')}:00`)),
          endDate: fc.option(fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') })
            .map(d => d.toISOString().split('T')[0])),
          endTime: fc.option(fc.integer({ min: 9, max: 18 }).map(h => `${h.toString().padStart(2, '0')}:00`))
        }).filter(data => {
          // Ensure at least one required field is missing (note: leaveType defaults to '事假' so we focus on other fields)
          return !data.startDate || !data.startTime || !data.endDate || !data.endTime;
        }),
        (incompleteData) => {
          const { container } = render(<LeaveApplication />, { wrapper: TestWrapper });

          // Fill in only the provided fields (leaveType has default value so we don't need to set it)

          if (incompleteData.startDate) {
            const startDateInput = container.querySelector('#startDate') as HTMLInputElement;
            fireEvent.change(startDateInput, { target: { value: incompleteData.startDate } });
          }

          if (incompleteData.startTime) {
            const startTimeInput = container.querySelector('#startTime') as HTMLInputElement;
            fireEvent.change(startTimeInput, { target: { value: incompleteData.startTime } });
          }

          if (incompleteData.endDate) {
            const endDateInput = container.querySelector('#endDate') as HTMLInputElement;
            fireEvent.change(endDateInput, { target: { value: incompleteData.endDate } });
          }

          if (incompleteData.endTime) {
            const endTimeInput = container.querySelector('#endTime') as HTMLInputElement;
            fireEvent.change(endTimeInput, { target: { value: incompleteData.endTime } });
          }

          // Submit button should be disabled when required fields are missing
          const submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement;
          expect(submitButton).toBeDisabled();
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 6 (Date Validation): End date/time should not be before start date/time
   */
  test('Property 6 (Date Validation): Should show error when end date/time is before start date/time', async () => {
    render(<LeaveApplication />, { wrapper: TestWrapper });

    // Set start date/time after end date/time (invalid)
    const startDateInput = screen.getByLabelText(/請假日期/i);
    fireEvent.change(startDateInput, { target: { value: '2024-06-15' } });

    const startTimeInput = screen.getByLabelText(/開始時間/i);
    fireEvent.change(startTimeInput, { target: { value: '14:00' } });

    // Note: LeaveApplication only has one date field (leaveDate), not separate end date

    const endTimeInput = screen.getByLabelText(/結束時間/i);
    fireEvent.change(endTimeInput, { target: { value: '10:00' } }); // Earlier than start time

    // Try to submit
    const submitButton = screen.getByRole('button', { name: /提交申請/i });
    fireEvent.click(submitButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/結束日期不能早於開始日期/i)).toBeInTheDocument();
    });
  });

  /**
   * Property 5 (Auto-fill behavior): Employee fields should always be read-only
   */
  test('Property 5 (Read-only fields): Employee ID and name fields should always be disabled', () => {
    render(<LeaveApplication />, { wrapper: TestWrapper });

    const employeeIdInput = screen.getByDisplayValue(mockUser.employeeId);
    const nameInput = screen.getByDisplayValue(mockUser.name);

    // Fields should be disabled
    expect(employeeIdInput).toBeDisabled();
    expect(nameInput).toBeDisabled();

    // Fields should have read-only styling
    expect(employeeIdInput).toHaveClass('bg-gray-100', 'cursor-not-allowed');
    expect(nameInput).toHaveClass('bg-gray-100', 'cursor-not-allowed');
  });
});