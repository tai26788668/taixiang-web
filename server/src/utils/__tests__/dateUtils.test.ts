import { 
  getTaiwanDateTime, 
  getTaiwanDate, 
  getTaiwanTime,
  convertUtcToTaiwan,
  convertTaiwanToUtc,
  calculateLeaveHours
} from '../dateUtils';

describe('dateUtils', () => {
  describe('getTaiwanDateTime', () => {
    test('should return current Taiwan time in correct format', () => {
      const result = getTaiwanDateTime();
      
      // 檢查格式 YYYY-MM-DD HH:mm:ss
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    test('should convert specific UTC date to Taiwan time', () => {
      // 2024-01-15 12:00:00 UTC = 2024-01-15 20:00:00 Taiwan (UTC+8)
      const utcDate = new Date('2024-01-15T12:00:00.000Z');
      const result = getTaiwanDateTime(utcDate);
      
      expect(result).toBe('2024-01-15 20:00:00');
    });

    test('should handle midnight UTC correctly', () => {
      // 2024-01-15 00:00:00 UTC = 2024-01-15 08:00:00 Taiwan
      const utcDate = new Date('2024-01-15T00:00:00.000Z');
      const result = getTaiwanDateTime(utcDate);
      
      expect(result).toBe('2024-01-15 08:00:00');
    });

    test('should handle date rollover correctly', () => {
      // 2024-01-14 20:00:00 UTC = 2024-01-15 04:00:00 Taiwan (next day)
      const utcDate = new Date('2024-01-14T20:00:00.000Z');
      const result = getTaiwanDateTime(utcDate);
      
      expect(result).toBe('2024-01-15 04:00:00');
    });
  });

  describe('getTaiwanDate', () => {
    test('should return Taiwan date in YYYY-MM-DD format', () => {
      const utcDate = new Date('2024-01-15T12:00:00.000Z');
      const result = getTaiwanDate(utcDate);
      
      expect(result).toBe('2024-01-15');
    });
  });

  describe('getTaiwanTime', () => {
    test('should return Taiwan time in HH:mm:ss format', () => {
      const utcDate = new Date('2024-01-15T12:00:00.000Z');
      const result = getTaiwanTime(utcDate);
      
      expect(result).toBe('20:00:00');
    });
  });

  describe('convertUtcToTaiwan', () => {
    test('should convert ISO UTC string to Taiwan time', () => {
      const utcString = '2024-01-15T12:00:00.000Z';
      const result = convertUtcToTaiwan(utcString);
      
      expect(result).toBe('2024-01-15 20:00:00');
    });

    test('should convert YYYY-MM-DD HH:mm:ss UTC string to Taiwan time', () => {
      const utcString = '2024-01-15 12:00:00';
      const result = convertUtcToTaiwan(utcString);
      
      expect(result).toBe('2024-01-15 20:00:00');
    });
  });

  describe('convertTaiwanToUtc', () => {
    test('should convert Taiwan time string to UTC ISO string', () => {
      const taiwanString = '2024-01-15 20:00:00';
      const result = convertTaiwanToUtc(taiwanString);
      
      // 應該轉換為UTC時間（減8小時）
      const expectedUtc = new Date('2024-01-15T12:00:00.000Z').toISOString();
      expect(result).toBe(expectedUtc);
    });

    test('should handle date rollover when converting to UTC', () => {
      // 台灣時間 2024-01-15 04:00:00 = UTC 2024-01-14 20:00:00 (前一天)
      const taiwanString = '2024-01-15 04:00:00';
      const result = convertTaiwanToUtc(taiwanString);
      
      const expectedUtc = new Date('2024-01-14T20:00:00.000Z').toISOString();
      expect(result).toBe(expectedUtc);
    });
  });

  describe('timezone consistency', () => {
    test('should maintain consistency between conversion functions', () => {
      const originalTaiwanTime = '2024-01-15 15:30:45';
      
      // 台灣時間 -> UTC -> 台灣時間
      const utcTime = convertTaiwanToUtc(originalTaiwanTime);
      const backToTaiwan = convertUtcToTaiwan(utcTime);
      
      expect(backToTaiwan).toBe(originalTaiwanTime);
    });

    test('should handle edge cases around midnight', () => {
      // 測試午夜前後的時間轉換
      const testCases = [
        '2024-01-15 00:00:00', // 台灣午夜
        '2024-01-15 23:59:59', // 台灣一天結束
        '2024-01-15 08:00:00', // UTC午夜對應的台灣時間
        '2024-01-15 16:00:00'  // UTC 08:00對應的台灣時間
      ];

      testCases.forEach(taiwanTime => {
        const utcTime = convertTaiwanToUtc(taiwanTime);
        const backToTaiwan = convertUtcToTaiwan(utcTime);
        expect(backToTaiwan).toBe(taiwanTime);
      });
    });
  });

  describe('calculateLeaveHours', () => {
    test('should calculate hours correctly for same day leave', () => {
      // 同一天請假：09:00 到 17:00 = 8小時
      const result = calculateLeaveHours('2024-01-15', '09:00', '17:00', false);
      
      // 8小時 - 0.5小時休息時間 = 7.5小時
      expect(result).toBe(7.5);
    });

    test('should calculate hours correctly for next day leave', () => {
      // 跨日請假：22:00 到隔日 08:00 = 10小時
      const result = calculateLeaveHours('2024-01-15', '22:00', '08:00', true);
      
      // 10小時，沒有休息時間重疊
      expect(result).toBe(10);
    });

    test('should calculate hours correctly for next day leave with rest periods', () => {
      // 跨日請假：11:00 到隔日 18:00 = 31小時
      const result = calculateLeaveHours('2024-01-15', '11:00', '18:00', true);
      
      // 31小時 - 0.5小時休息時間上限 = 30.5小時
      expect(result).toBe(30.5);
    });

    test('should throw error when end time is before start time on same day', () => {
      // 同一天，結束時間早於開始時間
      expect(() => {
        calculateLeaveHours('2024-01-15', '17:00', '09:00', false);
      }).toThrow('結束時間必須晚於開始時間');
    });

    test('should handle next day leave when end time appears earlier', () => {
      // 跨日請假，結束時間看起來較早但實際是隔日
      const result = calculateLeaveHours('2024-01-15', '23:00', '01:00', true);
      
      // 23:00 到隔日 01:00 = 2小時
      expect(result).toBe(2);
    });

    test('should throw error with helpful message for apparent time conflict', () => {
      // 當用戶忘記勾選隔日選項時
      expect(() => {
        calculateLeaveHours('2024-01-15', '22:00', '08:00', false);
      }).toThrow('結束時間必須晚於開始時間，或勾選"隔日"選項');
    });

    test('should calculate hours correctly when start time is next day', () => {
      // 開始時間是隔日，結束時間在同一天：隔日 08:00 到隔日 17:00 = 9小時
      const result = calculateLeaveHours('2024-01-15', '08:00', '17:00', false, true);
      
      // 9小時 - 0.5小時休息時間 = 8.5小時
      expect(result).toBe(8.5);
    });

    test('should calculate hours correctly when both start and end times are next day', () => {
      // 開始時間和結束時間都是隔日：隔日 08:00 到隔隔日 17:00 = 33小時
      const result = calculateLeaveHours('2024-01-15', '08:00', '17:00', true, true);
      
      // 33小時 - 0.5小時休息時間上限 = 32.5小時
      expect(result).toBe(32.5);
    });

    test('should calculate hours correctly for cross-day when both times are next day', () => {
      // 開始時間和結束時間都是隔日：隔日 22:00 到隔隔日 08:00 = 10小時
      const result = calculateLeaveHours('2024-01-15', '22:00', '08:00', true, true);
      
      // 10小時，沒有休息時間重疊 = 10小時
      expect(result).toBe(10);
    });

    test('should handle complex multi-day scenario with rest periods', () => {
      // 複雜跨日情況：隔日 11:00 到隔隔日 15:00 = 28小時
      const result = calculateLeaveHours('2024-01-15', '11:00', '15:00', true, true);
      
      // 28小時 - 0.5小時休息時間上限 = 27.5小時
      expect(result).toBe(27.5);
    });
  });
});