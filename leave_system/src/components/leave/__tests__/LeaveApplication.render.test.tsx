import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { LeaveApplication } from '../LeaveApplication';

// Mock all the dependencies
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      employeeId: 'EMP001',
      name: '測試員工',
      permission: 'employee' as const,
    },
    isAuthenticated: true,
    token: 'mock-token',
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('../../../services/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('LeaveApplication Render Test', () => {
  test('should render basic form elements', () => {
    render(<LeaveApplication />);
    
    // Check for basic form elements
    expect(screen.getByRole('form')).toBeInTheDocument();
  });
});