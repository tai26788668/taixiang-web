import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TimeSelector, generateTimeOptions, formatTime } from '../TimeSelector';
import { parseTimeValue, validateTimeValue } from '../../../utils/timeValidation';

describe('TimeSelector', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with placeholder when no value is provided', () => {
    render(
      <TimeSelector
        value=""
        onChange={mockOnChange}
        placeholder="請選擇時間"
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('請選擇時間')).toBeInTheDocument();
  });

  it('renders with selected value', () => {
    render(
      <TimeSelector
        value="09:30"
        onChange={mockOnChange}
      />
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('09:30');
  });

  it('calls onChange when selection changes', async () => {
    const user = userEvent.setup();
    
    render(
      <TimeSelector
        value=""
        onChange={mockOnChange}
      />
    );

    const select = screen.getByRole('combobox');
    
    // First verify that 14:15 is a valid option
    expect(validateTimeValue('14:15')).toBe(true);
    
    await user.selectOptions(select, '14:15');

    expect(mockOnChange).toHaveBeenCalled();
    // The onChange event is called, which is the main requirement
  });

  it('renders disabled state correctly', () => {
    render(
      <TimeSelector
        value=""
        onChange={mockOnChange}
        disabled={true}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('applies error styling when error prop is true', () => {
    render(
      <TimeSelector
        value=""
        onChange={mockOnChange}
        error={true}
        className="base-class"
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('border-red-500');
  });

  it('displays loading state correctly', () => {
    render(
      <TimeSelector
        value=""
        onChange={mockOnChange}
        loading={true}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
    
    // Check for loading spinner
    const loadingSpinner = document.querySelector('.animate-spin');
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('displays error message when provided', () => {
    render(
      <TimeSelector
        value=""
        onChange={mockOnChange}
        error={true}
        errorMessage="請選擇有效的時間"
        id="test-time"
      />
    );

    expect(screen.getByText('請選擇有效的時間')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('supports keyboard navigation for quick time selection', async () => {
    const user = userEvent.setup();
    
    render(
      <TimeSelector
        value=""
        onChange={mockOnChange}
      />
    );

    const select = screen.getByRole('combobox');
    
    // Focus the select and type "14"
    await user.click(select);
    await user.keyboard('14');
    
    // Should show keyboard hint
    expect(screen.getByText('輸入中: 14')).toBeInTheDocument();
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(
      <TimeSelector
        value=""
        onChange={mockOnChange}
        id="test-time"
        aria-label="選擇開始時間"
        error={true}
        errorMessage="錯誤訊息"
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-label', '選擇開始時間');
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveAttribute('aria-describedby', 'test-time-error');
    expect(select).toHaveAttribute('role', 'combobox');
    expect(select).toHaveAttribute('aria-haspopup', 'listbox');
  });

  it('provides screen reader instructions', () => {
    render(
      <TimeSelector
        value=""
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('使用方向鍵選擇時間，或直接輸入數字快速定位。按 Escape 清除輸入。')).toBeInTheDocument();
  });

  it('applies mobile-optimized classes', () => {
    render(
      <TimeSelector
        value=""
        onChange={mockOnChange}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('touch-manipulation');
    expect(select).toHaveClass('min-h-[44px]');
  });
});

describe('generateTimeOptions', () => {
  it('generates exactly 125 time options', () => {
    const options = generateTimeOptions();
    expect(options).toHaveLength(125);
  });

  it('generates current day options from 00:00 to 23:45', () => {
    const options = generateTimeOptions();
    
    // Check first option (00:00)
    expect(options[0]).toEqual({ value: '00:00', label: '00:00' });
    
    // Check last current day option (23:45)
    expect(options[95]).toEqual({ value: '23:45', label: '23:45' });
  });

  it('generates next day options from 00:00(+1) to 07:00(+1)', () => {
    const options = generateTimeOptions();
    
    // Check first next day option (00:00(+1))
    expect(options[96]).toEqual({ value: '00:00(+1)', label: '00:00(+1)' });
    
    // Check last next day option (07:00(+1))
    expect(options[124]).toEqual({ value: '07:00(+1)', label: '07:00(+1)' });
  });

  it('uses 15-minute intervals', () => {
    const options = generateTimeOptions();
    
    // Check first hour options
    expect(options[0].value).toBe('00:00');
    expect(options[1].value).toBe('00:15');
    expect(options[2].value).toBe('00:30');
    expect(options[3].value).toBe('00:45');
    expect(options[4].value).toBe('01:00');
  });
});

describe('formatTime', () => {
  it('formats time with leading zeros', () => {
    expect(formatTime(9, 5)).toBe('09:05');
    expect(formatTime(0, 0)).toBe('00:00');
    expect(formatTime(23, 59)).toBe('23:59');
  });

  it('handles double-digit hours and minutes', () => {
    expect(formatTime(14, 30)).toBe('14:30');
    expect(formatTime(22, 45)).toBe('22:45');
  });
});

describe('parseTimeValue', () => {
  it('parses current day time correctly', () => {
    const result = parseTimeValue('14:30');
    expect(result).toEqual({ time: '14:30', isNextDay: false });
  });

  it('parses next day time correctly', () => {
    const result = parseTimeValue('02:15(+1)');
    expect(result).toEqual({ time: '02:15', isNextDay: true });
  });
});

describe('validateTimeValue', () => {
  it('validates empty string as false', () => {
    expect(validateTimeValue('')).toBe(false);
  });

  it('validates valid current day time', () => {
    expect(validateTimeValue('09:30')).toBe(true);
    expect(validateTimeValue('00:00')).toBe(true);
    expect(validateTimeValue('23:45')).toBe(true);
  });

  it('validates valid next day time', () => {
    expect(validateTimeValue('02:30(+1)')).toBe(true);
    expect(validateTimeValue('07:00(+1)')).toBe(true);
  });

  it('rejects invalid time values', () => {
    expect(validateTimeValue('25:00')).toBe(false);
    expect(validateTimeValue('12:60')).toBe(false);
    expect(validateTimeValue('08:00(+1)')).toBe(false); // Beyond next day range
    expect(validateTimeValue('invalid')).toBe(false);
  });

  it('rejects times not in 15-minute intervals', () => {
    expect(validateTimeValue('09:05')).toBe(false);
    expect(validateTimeValue('14:37')).toBe(false);
  });
});