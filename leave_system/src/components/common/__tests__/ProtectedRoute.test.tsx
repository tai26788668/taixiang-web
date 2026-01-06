import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { ProtectedRoute } from '../ProtectedRoute';
import { ErrorProvider } from '../../../providers/ErrorProvider';

// Mock the useAuth hook to control authentication state
const mockUseAuth = vi.fn();
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock the auto-logout config
vi.mock('../../../config/autoLogout', () => ({
  isAutoLogoutEnabled: () => false, // Disable for tests
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common.loading': '載入中...',
      };
      return translations[key] || key;
    },
  }),
}));

// Test component
const TestComponent: React.FC = () => <div>Protected Content</div>;

// Test wrapper with necessary providers
const TestWrapper: React.FC<{ children: React.ReactNode; initialEntries?: string[] }> = ({ 
  children, 
  initialEntries = ['/'] 
}) => (
  <ErrorProvider>
    <MemoryRouter initialEntries={initialEntries}>
      {children}
    </MemoryRouter>
  </ErrorProvider>
);

describe('ProtectedRoute Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * **Feature: employee-leave-system, Property 1: 未驗證使用者重導向**
   * **Validates: Requirements 1.1**
   * 
   * 對於任何受保護的路由和未驗證的使用者，系統應該重導向到登入頁面
   */
  test('Property 1: Unauthenticated users should be redirected to login page', () => {
    // Mock unauthenticated state
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    // Render the protected route
    render(
      <TestWrapper initialEntries={['/leave/application']}>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </TestWrapper>
    );

    // Should not show protected content for unauthenticated users
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('Property 1 (Admin variant): Non-admin users should be redirected from admin routes', () => {
    const nonAdminUser = {
      employeeId: 'emp001',
      name: 'Test Employee',
      permission: 'employee' as const,
    };

    // Mock authenticated but non-admin user
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: nonAdminUser,
      isLoading: false,
      token: 'valid-token',
      login: vi.fn(),
      logout: vi.fn(),
    });

    // Render the admin protected route
    render(
      <TestWrapper initialEntries={['/admin/leave-management']}>
        <ProtectedRoute requireAdmin={true}>
          <TestComponent />
        </ProtectedRoute>
      </TestWrapper>
    );

    // Should not show protected content for non-admin users
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('Property 1 (Positive case): Authenticated users should see protected content', () => {
    const authenticatedUser = {
      employeeId: 'emp001',
      name: 'Test Employee',
      permission: 'employee' as const,
    };

    // Mock authenticated user
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: authenticatedUser,
      isLoading: false,
      token: 'valid-token',
      login: vi.fn(),
      logout: vi.fn(),
    });

    // Render the protected route
    render(
      <TestWrapper initialEntries={['/leave/application']}>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </TestWrapper>
    );

    // Should show protected content for authenticated users
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  test('Property 1 (Admin positive case): Admin users should see admin content', () => {
    const adminUser = {
      employeeId: 'admin001',
      name: 'Test Admin',
      permission: 'admin' as const,
    };

    // Mock authenticated admin user
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: adminUser,
      isLoading: false,
      token: 'valid-token',
      login: vi.fn(),
      logout: vi.fn(),
    });

    // Render the admin protected route
    render(
      <TestWrapper initialEntries={['/admin/leave-management']}>
        <ProtectedRoute requireAdmin={true}>
          <TestComponent />
        </ProtectedRoute>
      </TestWrapper>
    );

    // Should show protected content for admin users
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  test('Property 1 (Loading state): Loading state should show loading message', () => {
    // Mock loading state
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: true,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    // Render the protected route
    render(
      <TestWrapper initialEntries={['/leave/application']}>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </TestWrapper>
    );

    // Should show loading message
    expect(screen.getByText('載入中...')).toBeInTheDocument();
    // Should not show protected content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});