// import * as fc from 'fast-check'; // Note: fast-check dependency needs to be installed
import fs from 'fs';
import path from 'path';
import { readCsvFile, writeCsvFile, validateCsvData } from '../csvUtils';
import { PersonalData, LeaveRecord } from '../../types';

/**
 * **Feature: employee-leave-system, Property 16: CSV資料往返一致性**
 * **Validates: Requirements 7.1, 7.2, 7.3**
 */

describe('CSV Utils Property-Based Tests', () => {
  const testDir = path.join(__dirname, 'test-data');
  
  beforeAll(() => {
    // 建立測試目錄
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterAll(() => {
    // 清理測試目錄
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    // 清理測試檔案
    if (fs.existsSync(testDir)) {
      const files = fs.readdirSync(testDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(testDir, file));
      });
    }
  });

  /**
   * Property 16: CSV資料往返一致性
   * 對於任何有效的系統資料物件，寫入CSV然後讀取應該產生等效的物件
   * 
   * Note: This test requires fast-check to be installed for full property-based testing.
   * For now, we'll test with specific examples that demonstrate the round-trip property.
   */
  describe('Property 16: CSV資料往返一致性', () => {
    test('個人資料CSV往返一致性 - 範例測試', async () => {
      const originalData: PersonalData[] = [
        { employeeId: 'E001', password: 'pass123', name: '張小明', permission: 'employee', annualLeave: 14.0, sickLeave: 30.0, menstrualLeave: 3.0 },
        { employeeId: 'A001', password: 'admin456', name: '王管理', permission: 'admin', annualLeave: 21.0, sickLeave: 30.0, menstrualLeave: 0.0 },
        { employeeId: 'E002', password: 'test789', name: '李小華', permission: 'employee', annualLeave: 14.0, sickLeave: 30.0, menstrualLeave: 3.0 }
      ];

      const headers = [
        { id: 'employeeId', title: '工號' },
        { id: 'password', title: '密碼' },
        { id: 'name', title: '姓名' },
        { id: 'permission', title: '權限' }
      ];

      const testFile = path.join(testDir, 'personal-roundtrip-test.csv');
      
      try {
        // 寫入CSV
        await writeCsvFile(testFile, originalData, headers);
        
        // 讀取CSV
        const readData = await readCsvFile(testFile);
        
        // 驗證資料一致性
        expect(readData).toHaveLength(originalData.length);
        
        readData.forEach((record, index) => {
          const original = originalData[index];
          expect(record['工號']).toBe(original.employeeId);
          expect(record['密碼']).toBe(original.password);
          expect(record['姓名']).toBe(original.name);
          expect(record['權限']).toBe(original.permission);
        });
      } finally {
        // 清理測試檔案
        if (fs.existsSync(testFile)) {
          fs.unlinkSync(testFile);
        }
      }
    });

    test('請假記錄CSV往返一致性 - 範例測試', async () => {
      const originalData: LeaveRecord[] = [
        {
          id: 'R001',
          employeeId: 'E001',
          name: '張小明',
          leaveType: '事假',
          leaveDate: '2024-01-15',
          startTime: '09:00',
          endDate: '2024-01-15',
          endTime: '17:00',
          isStartNextDay: false,
          leaveHours: 8,
          reason: '個人事務',
          approvalStatus: '已審核',
          applicationDateTime: '2024-01-14 10:30:00',
          approvalDate: '2024-01-14 15:20:00',
          approver: '王管理'
        },
        {
          id: 'R002',
          employeeId: 'E002',
          name: '李小華',
          leaveType: '病假',
          leaveDate: '2024-01-16',
          startTime: '09:00',
          endDate: '2024-01-16',
          endTime: '17:00',
          isStartNextDay: false,
          leaveHours: 16,
          reason: '感冒就醫',
          approvalStatus: '簽核中',
          applicationDateTime: '2024-01-15 14:20:00'
        }
      ];

      const headers = [
        { id: 'id', title: '記錄ID' },
        { id: 'employeeId', title: '工號' },
        { id: 'name', title: '姓名' },
        { id: 'leaveType', title: '假別' },
        { id: 'leaveDate', title: '請假日期' },
        { id: 'startTime', title: '開始時間' },
        { id: 'endDate', title: '結束日期' },
        { id: 'endTime', title: '結束時間' },
        { id: 'isStartNextDay', title: '開始時間隔日' },
        { id: 'leaveHours', title: '請假時數' },
        { id: 'reason', title: '事由' },
        { id: 'approvalStatus', title: '簽核狀態' },
        { id: 'applicationDateTime', title: '申請日期時間' },
        { id: 'approvalDate', title: '簽核日期' },
        { id: 'approver', title: '簽核者' }
      ];

      const testFile = path.join(testDir, 'leave-roundtrip-test.csv');
      
      try {
        // 寫入CSV
        await writeCsvFile(testFile, originalData, headers);
        
        // 讀取CSV
        const readData = await readCsvFile(testFile);
        
        // 驗證資料一致性
        expect(readData).toHaveLength(originalData.length);
        
        readData.forEach((record, index) => {
          const original = originalData[index];
          expect(record['記錄ID']).toBe(original.id);
          expect(record['工號']).toBe(original.employeeId);
          expect(record['姓名']).toBe(original.name);
          expect(record['假別']).toBe(original.leaveType);
          expect(record['請假日期']).toBe(original.leaveDate);
          expect(record['開始時間']).toBe(original.startTime);
          expect(record['結束日期']).toBe(original.endDate);
          expect(record['結束時間']).toBe(original.endTime);
          expect(record['開始時間隔日']).toBe(original.isStartNextDay?.toString() || 'false');
          expect(record['請假時數']).toBe(original.leaveHours.toString());
          expect(record['事由']).toBe(original.reason || '');
          expect(record['簽核狀態']).toBe(original.approvalStatus);
          expect(record['申請日期時間']).toBe(original.applicationDateTime);
          expect(record['簽核日期']).toBe(original.approvalDate || '');
          expect(record['簽核者']).toBe(original.approver || '');
        });
      } finally {
        // 清理測試檔案
        if (fs.existsSync(testFile)) {
          fs.unlinkSync(testFile);
        }
      }
    });

    test('CSV資料驗證一致性 - 範例測試', () => {
      // 測試有效資料
      const validData = [
        { field1: 'value1', field2: 'value2' },
        { field1: 'value3', field2: 'value4' }
      ];
      const requiredFields = ['field1', 'field2'];
      
      const validResult = validateCsvData(validData, requiredFields);
      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toHaveLength(0);

      // 測試無效資料 - 缺少必填欄位
      const invalidData = [
        { field1: 'value1', field2: '' },
        { field1: '', field2: 'value2' }
      ];
      
      const invalidResult = validateCsvData(invalidData, requiredFields);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors.length).toBeGreaterThan(0);

      // 測試空資料
      const emptyResult = validateCsvData([], requiredFields);
      expect(emptyResult.isValid).toBe(false);
      expect(emptyResult.errors).toContain('資料不能為空');
    });
  });

  // 單元測試 - 測試特定邊界情況
  describe('Unit Tests - Edge Cases', () => {
    test('處理空字串和特殊字元', async () => {
      const testData = [
        { field1: '', field2: 'value2' },
        { field1: 'value1', field2: '特殊字元,測試' },
        { field1: '  空白測試  ', field2: 'value2' }
      ];

      const headers = [
        { id: 'field1', title: 'Field1' },
        { id: 'field2', title: 'Field2' }
      ];

      const testFile = path.join(testDir, 'edge-case-test.csv');

      await writeCsvFile(testFile, testData, headers);
      const readData = await readCsvFile(testFile);

      expect(readData).toHaveLength(3);
      expect(readData[0]['Field1']).toBe('');
      expect(readData[1]['Field2']).toBe('特殊字元,測試');
      expect(readData[2]['Field1']).toBe('空白測試'); // 應該去除前後空白
    });

    test('處理不存在的檔案', async () => {
      const nonExistentFile = path.join(testDir, 'non-existent.csv');
      
      await expect(readCsvFile(nonExistentFile)).rejects.toThrow('CSV檔案不存在');
    });

    test('驗證空資料', () => {
      const validation = validateCsvData([], ['field1']);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('資料不能為空');
    });
  });
});