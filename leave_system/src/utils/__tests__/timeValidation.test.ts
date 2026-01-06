/**
 * 時間驗證和計算功能測試
 */
import { describe, it, expect } from 'vitest';
import {
  parseTimeValue,
  formatTimeForStorage,
  timeToMinutes,
  minutesToTime,
  validateTimeRange,
  calculateLeaveHours,
  validateTimeValue,
  validateTimeInput,
  getTimeValidationRules,
  getErrorMessage,
  TimeValidationError,
  REST_PERIODS,
  MAX_REST_DEDUCTION_MINUTES
} from '../timeValidation';

describe('timeValidation', () => {
  describe('parseTimeValue', () => {
    it('should parse current day time correctly', () => {
      const result = parseTimeValue('09:30');
      expect(result).toEqual({
        time: '09:30',
        isNextDay: false
      });
    });

    it('should parse next day time correctly', () => {
      const result = parseTimeValue('02:15(+1)');
      expect(result).toEqual({
        time: '02:15',
        isNextDay: true
      });
    });
  });

  describe('formatTimeForStorage', () => {
    it('should format current day time correctly', () => {
      const result = formatTimeForStorage('09:30', false);
      expect(result).toBe('09:30');
    });

    it('should format next day time correctly', () => {
      const result = formatTimeForStorage('02:15', true);
      expect(result).toBe('02:15(+1)');
    });
  });

  describe('timeToMinutes', () => {
    it('should convert time to minutes correctly', () => {
      expect(timeToMinutes('00:00')).toBe(0);
      expect(timeToMinutes('01:00')).toBe(60);
      expect(timeToMinutes('09:30')).toBe(570);
      expect(timeToMinutes('23:45')).toBe(1425);
    });
  });

  describe('minutesToTime', () => {
    it('should convert minutes to time correctly', () => {
      expect(minutesToTime(0)).toBe('00:00');
      expect(minutesToTime(60)).toBe('01:00');
      expect(minutesToTime(570)).toBe('09:30');
      expect(minutesToTime(1425)).toBe('23:45');
    });
  });

  describe('validateTimeValue', () => {
    it('should validate correct current day times', () => {
      expect(validateTimeValue('00:00')).toBe(true);
      expect(validateTimeValue('09:15')).toBe(true);
      expect(validateTimeValue('12:30')).toBe(true);
      expect(validateTimeValue('23:45')).toBe(true);
    });

    it('should validate correct next day times', () => {
      expect(validateTimeValue('00:00(+1)')).toBe(true);
      expect(validateTimeValue('03:15(+1)')).toBe(true);
      expect(validateTimeValue('07:00(+1)')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(validateTimeValue('')).toBe(false);
      expect(validateTimeValue('25:00')).toBe(false);
      expect(validateTimeValue('12:60')).toBe(false);
      expect(validateTimeValue('abc')).toBe(false);
    });

    it('should reject times not in 15-minute intervals', () => {
      expect(validateTimeValue('09:05')).toBe(false);
      expect(validateTimeValue('12:37')).toBe(false);
    });

    it('should reject next day times beyond 07:00', () => {
      expect(validateTimeValue('08:00(+1)')).toBe(false);
      expect(validateTimeValue('12:00(+1)')).toBe(false);
    });
  });

  describe('validateTimeRange', () => {
    it('should validate correct time ranges', () => {
      const result = validateTimeRange('09:00', '17:00');
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });

    it('should validate next day time ranges', () => {
      const result = validateTimeRange('22:00', '06:00(+1)');
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });

    it('should reject end time before start time', () => {
      const result = validateTimeRange('17:00', '09:00');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('結束時間必須晚於開始時間');
    });

    it('should reject empty times', () => {
      const result = validateTimeRange('', '17:00');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('請選擇開始時間和結束時間');
    });
  });

  describe('calculateLeaveHours', () => {
    it('should calculate basic hours correctly', () => {
      const result = calculateLeaveHours('09:00', '17:00');
      expect(result.startTime).toBe('09:00');
      expect(result.endTime).toBe('17:00');
      expect(result.totalMinutes).toBe(480); // 8 hours
      expect(result.leaveHours).toBe(7.5); // 8 hours - 0.5 hour rest
    });

    it('should calculate hours with lunch break deduction', () => {
      const result = calculateLeaveHours('11:00', '13:00');
      expect(result.totalMinutes).toBe(120); // 2 hours
      expect(result.restMinutesDeducted).toBe(30); // 30 minutes lunch break
      expect(result.leaveHours).toBe(1.5); // 2 hours - 0.5 hour
    });

    it('should calculate hours with afternoon break deduction', () => {
      const result = calculateLeaveHours('16:00', '18:00');
      expect(result.totalMinutes).toBe(120); // 2 hours
      expect(result.restMinutesDeducted).toBe(30); // 30 minutes afternoon break
      expect(result.leaveHours).toBe(1.5); // 2 hours - 0.5 hour
    });

    it('should limit rest deduction to maximum', () => {
      const result = calculateLeaveHours('11:00', '18:00');
      expect(result.totalMinutes).toBe(420); // 7 hours
      expect(result.restMinutesDeducted).toBe(30); // Limited to 30 minutes max
      expect(result.leaveHours).toBe(6.5); // 7 hours - 0.5 hour
    });

    it('should calculate next day hours correctly', () => {
      const result = calculateLeaveHours('22:00', '06:00(+1)');
      expect(result.totalMinutes).toBe(480); // 8 hours
      expect(result.restMinutesDeducted).toBe(0); // No rest periods overnight
      expect(result.leaveHours).toBe(8);
    });

    it('should throw error for invalid time range', () => {
      expect(() => calculateLeaveHours('17:00', '09:00')).toThrow('結束時間必須晚於開始時間');
    });
  });

  describe('validateTimeInput', () => {
    it('should validate complete valid input', () => {
      const result = validateTimeInput('09:00', '17:00');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const result = validateTimeInput('', '17:00');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('startTime');
      expect(result.errors[0].error).toBe(TimeValidationError.REQUIRED_FIELD_EMPTY);
    });

    it('should detect invalid time values', () => {
      const result = validateTimeInput('25:00', '17:00');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('startTime');
      expect(result.errors[0].error).toBe(TimeValidationError.TIME_NOT_IN_OPTIONS);
    });

    it('should detect invalid time range', () => {
      const result = validateTimeInput('17:00', '09:00');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('timeRange');
      expect(result.errors[0].error).toBe(TimeValidationError.END_TIME_BEFORE_START);
    });
  });

  describe('getTimeValidationRules', () => {
    it('should return correct validation rules', () => {
      const rules = getTimeValidationRules();
      expect(rules.required).toBe(true);
      expect(rules.format).toBeInstanceOf(RegExp);
      expect(rules.allowedValues).toHaveLength(125); // 96 current day + 29 next day
    });

    it('should include all expected time options', () => {
      const rules = getTimeValidationRules();
      
      // Check some current day options
      expect(rules.allowedValues).toContain('00:00');
      expect(rules.allowedValues).toContain('09:15');
      expect(rules.allowedValues).toContain('23:45');
      
      // Check some next day options
      expect(rules.allowedValues).toContain('00:00(+1)');
      expect(rules.allowedValues).toContain('03:30(+1)');
      expect(rules.allowedValues).toContain('07:00(+1)');
      
      // Should not include invalid options
      expect(rules.allowedValues).not.toContain('08:00(+1)');
      expect(rules.allowedValues).not.toContain('09:05');
    });
  });

  describe('getErrorMessage', () => {
    it('should return correct error messages', () => {
      expect(getErrorMessage(TimeValidationError.INVALID_TIME_FORMAT))
        .toBe('時間格式不正確，請使用HH:MM格式');
      expect(getErrorMessage(TimeValidationError.REQUIRED_FIELD_EMPTY))
        .toBe('此欄位為必填');
      expect(getErrorMessage(TimeValidationError.END_TIME_BEFORE_START))
        .toBe('結束時間必須晚於開始時間');
    });
  });

  describe('REST_PERIODS configuration', () => {
    it('should have correct rest periods', () => {
      expect(REST_PERIODS).toHaveLength(2);
      expect(REST_PERIODS[0]).toEqual({ start: '12:00', end: '12:30' });
      expect(REST_PERIODS[1]).toEqual({ start: '16:30', end: '17:00' });
    });

    it('should have correct maximum rest deduction', () => {
      expect(MAX_REST_DEDUCTION_MINUTES).toBe(30);
    });
  });
});