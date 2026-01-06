/**
 * useTimeValidation Hook 測試
 */
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimeValidation } from '../useTimeValidation';
import { TimeValidationError } from '../../utils/timeValidation';

describe('useTimeValidation', () => {
  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useTimeValidation());
    
    expect(result.current.startTime).toBe('');
    expect(result.current.endTime).toBe('');
    expect(result.current.isValid).toBe(false);
    expect(result.current.errors).toHaveLength(0);
    expect(result.current.leaveHours).toBeNull();
    expect(result.current.calculation).toBeNull();
  });

  it('should set start time and validate', () => {
    const { result } = renderHook(() => useTimeValidation());
    
    act(() => {
      result.current.setStartTime('09:00');
    });
    
    expect(result.current.startTime).toBe('09:00');
    expect(result.current.isValid).toBe(false); // Still invalid because no end time
    expect(result.current.hasFieldError('startTime')).toBe(false);
  });

  it('should set end time and validate', () => {
    const { result } = renderHook(() => useTimeValidation());
    
    act(() => {
      result.current.setEndTime('17:00');
    });
    
    expect(result.current.endTime).toBe('17:00');
    expect(result.current.isValid).toBe(false); // Still invalid because no start time
  });

  it('should validate complete time range and calculate hours', () => {
    const onHoursCalculated = vi.fn();
    const { result } = renderHook(() => 
      useTimeValidation({ onHoursCalculated })
    );
    
    act(() => {
      result.current.setTimes('09:00', '17:00');
    });
    
    expect(result.current.startTime).toBe('09:00');
    expect(result.current.endTime).toBe('17:00');
    expect(result.current.isValid).toBe(true);
    expect(result.current.leaveHours).toBe(7.5); // 8 hours - 0.5 rest
    expect(result.current.calculation).not.toBeNull();
    expect(onHoursCalculated).toHaveBeenCalledWith(
      expect.objectContaining({
        startTime: '09:00',
        endTime: '17:00',
        leaveHours: 7.5
      })
    );
  });

  it('should detect validation errors', () => {
    const { result } = renderHook(() => useTimeValidation());
    
    act(() => {
      result.current.setTimes('17:00', '09:00'); // Invalid range
    });
    
    expect(result.current.isValid).toBe(false);
    expect(result.current.hasErrors).toBe(true);
    expect(result.current.rangeError).toBeDefined();
    expect(result.current.rangeError?.error).toBe(TimeValidationError.END_TIME_BEFORE_START);
  });

  it('should detect required field errors', () => {
    const { result } = renderHook(() => useTimeValidation());
    
    act(() => {
      result.current.setTimes('', '17:00'); // Missing start time
    });
    
    expect(result.current.isValid).toBe(false);
    expect(result.current.startTimeError).toBeDefined();
    expect(result.current.startTimeError?.error).toBe(TimeValidationError.REQUIRED_FIELD_EMPTY);
  });

  it('should reset state correctly', () => {
    const { result } = renderHook(() => useTimeValidation());
    
    // Set some values first
    act(() => {
      result.current.setTimes('09:00', '17:00');
    });
    
    expect(result.current.isValid).toBe(true);
    
    // Reset
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.startTime).toBe('');
    expect(result.current.endTime).toBe('');
    expect(result.current.isValid).toBe(false);
    expect(result.current.errors).toHaveLength(0);
    expect(result.current.leaveHours).toBeNull();
    expect(result.current.calculation).toBeNull();
  });

  it('should manually calculate hours', () => {
    const { result } = renderHook(() => useTimeValidation({ autoCalculateHours: false }));
    
    act(() => {
      result.current.setTimes('09:00', '17:00');
    });
    
    // Should not auto-calculate
    expect(result.current.leaveHours).toBeNull();
    
    // Manual calculation
    act(() => {
      const calculation = result.current.calculateHours();
      expect(calculation.leaveHours).toBe(7.5);
    });
    
    expect(result.current.leaveHours).toBe(7.5);
  });

  it('should validate time range manually', () => {
    const { result } = renderHook(() => useTimeValidation());
    
    const validation = result.current.validateRange('09:00', '17:00');
    expect(validation.isValid).toBe(true);
    
    const invalidValidation = result.current.validateRange('17:00', '09:00');
    expect(invalidValidation.isValid).toBe(false);
  });

  it('should handle next day time calculations', () => {
    const { result } = renderHook(() => useTimeValidation());
    
    act(() => {
      result.current.setTimes('22:00', '06:00(+1)');
    });
    
    expect(result.current.isValid).toBe(true);
    expect(result.current.leaveHours).toBe(8); // 8 hours overnight, no rest deduction
  });

  it('should call onValidationChange callback', () => {
    const onValidationChange = vi.fn();
    const { result } = renderHook(() => 
      useTimeValidation({ onValidationChange })
    );
    
    act(() => {
      result.current.setTimes('09:00', '17:00');
    });
    
    expect(onValidationChange).toHaveBeenCalledWith(true);
    
    act(() => {
      result.current.setTimes('17:00', '09:00'); // Invalid
    });
    
    expect(onValidationChange).toHaveBeenCalledWith(false);
  });

  it('should get field-specific errors', () => {
    const { result } = renderHook(() => useTimeValidation());
    
    act(() => {
      result.current.setTimes('', ''); // Both empty
    });
    
    const startError = result.current.getFieldError('startTime');
    const endError = result.current.getFieldError('endTime');
    
    expect(startError).toBeDefined();
    expect(endError).toBeDefined();
    expect(startError?.error).toBe(TimeValidationError.REQUIRED_FIELD_EMPTY);
    expect(endError?.error).toBe(TimeValidationError.REQUIRED_FIELD_EMPTY);
  });

  it('should get all error messages', () => {
    const { result } = renderHook(() => useTimeValidation());
    
    act(() => {
      result.current.setTimes('', ''); // Both empty
    });
    
    const messages = result.current.getAllErrorMessages;
    expect(messages).toHaveLength(2);
    expect(messages).toContain('此欄位為必填');
  });

  it('should handle calculation errors gracefully', () => {
    const { result } = renderHook(() => useTimeValidation());
    
    act(() => {
      try {
        result.current.calculateHours('17:00', '09:00'); // Invalid range
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('結束時間必須晚於開始時間');
      }
    });
  });
});