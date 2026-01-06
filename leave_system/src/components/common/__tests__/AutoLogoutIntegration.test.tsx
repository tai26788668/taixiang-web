import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthProvider } from '../../../providers/AuthProvider';
import { ErrorProvider } from '../../../providers/ErrorProvider';
import { AutoLogoutManager } from '../AutoLogoutManager';

// Mock the auto-logout hook
const mockUseAutoLogout = vi.fn();
vi.mock('../../../hooks/useAutoLogout', () => ({
  useAutoLogout: () => mockUseAutoLogout(),
}));

// Mock the auth hook
const mockUseAuth = vi.fn();
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
  useAuthState: () => mockUseAuth(),
  AuthContext: React.createContext(null),
}));

// Mock auto-logout config
vi.mock('../../../config/autoLogout', () => ({
  isAutoLogoutEnabled: () => true,
  getAutoLogoutSettings: () => ({
    timeoutDuration: 1200000, // 20 minutes
    checkInterval: 1000,
    enabled: true,
    autoRedirectDelay: 3
  }),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('Auto-logout Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('AutoLogoutManager integrates properly with providers', () => {
    // Mock authenticated state
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { employeeId: 'test', name: 'Test User', permission: 'employee' },
      isLoading: false,
      token: 'test-token',
      login: vi.fn(),
      logout: vi.fn(),
    });

    // Mock auto-logout not showing timeout message
    mockUseAutoLogout.mockReturnValue({
      showTimeoutMessage: false,
      remainingTime: 1200000,
      relogin: vi.fn(),
      isEnabled: true,
      extendSession: vi.fn(),
      logoutReason: null,
    });

    // Render with all providers
    render(
      <ErrorProvider>
        <MemoryRouter>
          <AuthProvider>
            <AutoLogoutManager />
          </AuthProvider>
        </MemoryRouter>
      </ErrorProvider>
    );

    // Should not show timeout message when not timed out
    expect(screen.queryByText(/autoLogout.sessionExpired/)).not.toBeInTheDocument();
  });

  test('AutoLogoutManager shows timeout message when triggered', () => {
    // Mock authenticated state
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { employeeId: 'test', name: 'Test User', permission: 'employee' },
      isLoading: false,
      token: 'test-token',
      login: vi.fn(),
      logout: vi.fn(),
    });

    // Mock auto-logout showing timeout message
    mockUseAutoLogout.mockReturnValue({
      showTimeoutMessage: true,
      remainingTime: 0,
      relogin: vi.fn(),
      isEnabled: true,
      extendSession: vi.fn(),
      logoutReason: 'timeout',
    });

    // Render with all providers
    render(
      <ErrorProvider>
        <MemoryRouter>
          <AuthProvider>
            <AutoLogoutManager />
          </AuthProvider>
        </MemoryRouter>
      </ErrorProvider>
    );

    // Should show timeout message when timed out
    expect(screen.getByText('autoLogout.sessionExpired')).toBeInTheDocument();
  });

  test('AuthProvider handles auto-logout integration', () => {
    const mockLogout = vi.fn();
    
    // Mock authenticated state
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { employeeId: 'test', name: 'Test User', permission: 'employee' },
      isLoading: false,
      token: 'test-token',
      login: vi.fn(),
      logout: mockLogout,
    });

    // Render AuthProvider
    render(
      <ErrorProvider>
        <MemoryRouter>
          <AuthProvider>
            <div>Test Content</div>
          </AuthProvider>
        </MemoryRouter>
      </ErrorProvider>
    );

    // Should render without errors
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});