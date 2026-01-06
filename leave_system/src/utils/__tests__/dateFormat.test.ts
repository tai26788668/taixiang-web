import { describe, test, expect, vi, beforeEach } from 'vitest';
import { formatDate, formatTime, formatDateTime, formatApplicationDateTime } from '../dateFormat';
import i18n from '../../i18n';

// Mock i18n
vi.mock('../../i18n', () => ({
  default: {
    language: 'zh-TW'
  }
}));

describe('dateFormat', () => {
  beforeEach(() => {
    // Reset language to default
    (i18n as any).language = 'zh-TW';
  });

  describe('formatDate', () => {
    test('should format date in Chinese (zh-TW)', () => {
      (i18n as any).language = 'zh-TW';
      const result = formatDate('2024-03-15');
      expect(result).toBe('2024/03/15');
    });

    test('should format date in English (en-US)', () => {
      (i18n as any).language = 'en-US';
      const result = formatDate('2024-03-15');
      expect(result).toBe('03/15/2024');
    });

    test('should format date in Indonesian (id-ID)', () => {
      (i18n as any).language = 'id-ID';
      const result = formatDate('2024-03-15');
      expect(result).toBe('15/03/2024');
    });

    test('should return empty string for empty input', () => {
      const result = formatDate('');
      expect(result).toBe('');
    });

    test('should return original string for invalid date', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('invalid-date');
    });
  });

  describe('formatTime', () => {
    test('should format regular time', () => {
      const result = formatTime('09:30');
      expect(result).toBe('09:30');
    });

    test('should format next day time', () => {
      const result = formatTime('02:15(+1)');
      expect(result).toBe('02:15(+1)');
    });

    test('should return empty string for empty input', () => {
      const result = formatTime('');
      expect(result).toBe('');
    });

    test('should return original string for invalid time format', () => {
      const result = formatTime('25:00');
      expect(result).toBe('25:00');
    });
  });

  describe('formatDateTime', () => {
    test('should format date and time together in Chinese', () => {
      (i18n as any).language = 'zh-TW';
      const result = formatDateTime('2024-03-15', '09:30');
      expect(result).toBe('2024/03/15 09:30');
    });

    test('should format date and time together in English', () => {
      (i18n as any).language = 'en-US';
      const result = formatDateTime('2024-03-15', '09:30');
      expect(result).toBe('03/15/2024 09:30');
    });

    test('should format date and time with next day marker', () => {
      (i18n as any).language = 'zh-TW';
      const result = formatDateTime('2024-03-15', '02:15(+1)');
      expect(result).toBe('2024/03/15 02:15(+1)');
    });

    test('should return "undefined" for missing date or time', () => {
      expect(formatDateTime('', '09:30')).toBe('undefined');
      expect(formatDateTime('2024-03-15', '')).toBe('undefined');
      expect(formatDateTime('', '')).toBe('undefined');
    });
  });

  describe('formatApplicationDateTime', () => {
    test('should format ISO datetime in Chinese', () => {
      (i18n as any).language = 'zh-TW';
      const result = formatApplicationDateTime('2024-03-15T14:30:45.123Z');
      // Note: The exact format may vary based on timezone, so we check for key components
      expect(result).toMatch(/2024/);
      expect(result).toMatch(/03/);
      expect(result).toMatch(/15/);
    });

    test('should format ISO datetime in English', () => {
      (i18n as any).language = 'en-US';
      const result = formatApplicationDateTime('2024-03-15T14:30:45.123Z');
      // Note: The exact format may vary based on timezone, so we check for key components
      expect(result).toMatch(/2024/);
      expect(result).toMatch(/03/);
      expect(result).toMatch(/15/);
    });

    test('should return empty string for empty input', () => {
      const result = formatApplicationDateTime('');
      expect(result).toBe('');
    });

    test('should fallback to simple format for invalid datetime', () => {
      const result = formatApplicationDateTime('invalid-datetime');
      expect(result).toBe('invalid-datetime');
    });
  });

  describe('language fallback', () => {
    test('should fallback to zh-TW for unknown language', () => {
      (i18n as any).language = 'unknown-lang';
      const result = formatDate('2024-03-15');
      expect(result).toBe('2024/03/15');
    });

    test('should handle missing i18n.language', () => {
      (i18n as any).language = undefined;
      const result = formatDate('2024-03-15');
      expect(result).toBe('2024/03/15');
    });
  });
});