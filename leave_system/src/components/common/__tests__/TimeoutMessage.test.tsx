import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TimeoutMessage } from '../TimeoutMessage';

// Mock the useLanguage hook to return simple strings
vi.mock('../../hooks/useLanguage', () => ({
  useLanguage: () => ({
    t: (key: string, params?: any) => {
      if (key === 'autoLogout.autoRedirectMessage' && params?.seconds) {
        return `Redirecting in ${params.seconds} seconds`;
      }
      return key; // Return the key itself for simplicity
    }
  })
}));

describe('TimeoutMessage', () => {
  const mockOnRelogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not render when isVisible is false', () => {
    render(
      <TimeoutMessage
        isVisible={false}
        onRelogin={mockOnRelogin}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render timeout message when isVisible is true', () => {
    render(
      <TimeoutMessage
        isVisible={true}
        onRelogin={mockOnRelogin}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should call onRelogin when relogin button is clicked', () => {
    render(
      <TimeoutMessage
        isVisible={true}
        onRelogin={mockOnRelogin}
      />
    );

    const reloginButton = screen.getByRole('button');
    fireEvent.click(reloginButton);

    expect(mockOnRelogin).toHaveBeenCalledTimes(1);
  });

  it('should have proper accessibility attributes', () => {
    render(
      <TimeoutMessage
        isVisible={true}
        onRelogin={mockOnRelogin}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'timeout-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'timeout-description');

    const title = screen.getByRole('heading');
    expect(title).toHaveAttribute('id', 'timeout-title');

    const description = document.getElementById('timeout-description');
    expect(description).toBeInTheDocument();
  });

  it('should have responsive design classes', () => {
    render(
      <TimeoutMessage
        isVisible={true}
        onRelogin={mockOnRelogin}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('fixed', 'inset-0', 'flex', 'items-center', 'justify-center');
    
    const content = dialog.firstChild as HTMLElement;
    expect(content).toHaveClass('max-w-md', 'w-full', 'mx-4');
  });
});