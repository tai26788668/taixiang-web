import * as fc from 'fast-check';
import { calculateLeaveHours } from '../../utils/dateUtils';

describe('leaveRecordService', () => {
  describe('calculateLeaveHours', () => {
    test('請假時數計算屬性測試', () => {
      const timeArb = fc.record({
        leaveDate: fc.constantFrom('2024-01-15', '2024-02-20', '2024-03-10'),
        startTime: fc.constantFrom('07:00', '08:00', '09:00', '10:00', '11:00', '13:00', '14:00'),
        endTime: fc.constantFrom('12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00')
      });

      fc.assert(fc.property(timeArb, ({ leaveDate, startTime, endTime }) => {
        const startDateTime = new Date(`${leaveDate}T${startTime}:00`);
        const endDateTime = new Date(`${leaveDate}T${endTime}:00`);

        if (endDateTime > startDateTime) {
          const calculatedHours = calculateLeaveHours(leaveDate, startTime, endTime);
          expect(Number.isFinite(calculatedHours)).toBe(true);
          expect(calculatedHours).toBeGreaterThan(0);
          
          const diffMs = endDateTime.getTime() - startDateTime.getTime();
          const basicHours = diffMs / (1000 * 60 * 60);
          expect(calculatedHours).toBeLessThanOrEqual(basicHours + 0.01);
          
          const restDeduction = basicHours - calculatedHours;
          expect(restDeduction).toBeLessThanOrEqual(0.5 + 0.01);
          expect(restDeduction).toBeGreaterThanOrEqual(-0.01);
        }
      }), { numRuns: 100 });
    });

    test('應該拒絕無效的時間範圍', () => {
      expect(() => {
        calculateLeaveHours('2024-01-15', '09:00', '09:00');
      }).toThrow('結束時間必須晚於開始時間');
    });

    test('應該拒絕結束時間早於開始時間', () => {
      expect(() => {
        calculateLeaveHours('2024-01-15', '17:00', '09:00');
      }).toThrow('結束時間必須晚於開始時間');
    });
  });
});