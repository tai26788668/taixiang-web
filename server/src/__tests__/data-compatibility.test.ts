/**
 * 資料相容性測試
 * 驗證時間選擇器產生的資料格式與現有CSV結構相容
 */

import { 
  addLeaveRecord, 
  getLeaveRecordById, 
  updateLeaveRecord,
  getAllLeaveRecords 
} from '../services/leaveRecordService';
import { LeaveRecord } from '../types';
import { getTaiwanDateTime } from '../utils/dateUtils';
import fs from 'fs';
import path from 'path';

// 測試用的CSV檔案路徑
const TEST_CSV_PATH = path.join(__dirname, '../../test-data/請假記錄.csv');

describe('資料相容性測試', () => {
  beforeEach(() => {
    // 確保測試目錄存在
    const testDir = path.dirname(TEST_CSV_PATH);
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    // 清空測試檔案
    if (fs.existsSync(TEST_CSV_PATH)) {
      fs.unlinkSync(TEST_CSV_PATH);
    }
  });

  afterEach(() => {
    // 清理測試檔案
    if (fs.existsSync(TEST_CSV_PATH)) {
      fs.unlinkSync(TEST_CSV_PATH);
    }
  });

  describe('時間格式相容性', () => {
    test('應該正確儲存和讀取當日時間', async () => {
      const leaveRecord: Omit<LeaveRecord, 'id'> = {
        employeeId: 'E001',
        name: '測試員工',
        leaveType: '事假',
        leaveDate: '2024-06-15',
        startTime: '09:00',
        endDate: '2024-06-15',
        endTime: '17:00',
        isStartNextDay: false,
        leaveHours: 7.5,
        reason: '個人事務',
        approvalStatus: '簽核中',
        applicationDateTime: getTaiwanDateTime()
      };

      // 新增記錄
      const recordId = await addLeaveRecord(leaveRecord);
      expect(recordId).toBeDefined();

      // 讀取記錄
      const retrievedRecord = await getLeaveRecordById(recordId);
      expect(retrievedRecord).toBeDefined();
      expect(retrievedRecord!.startTime).toBe('09:00');
      expect(retrievedRecord!.endTime).toBe('17:00');
      expect(retrievedRecord!.isStartNextDay).toBe(false);
      expect(retrievedRecord!.leaveDate).toBe('2024-06-15');
      expect(retrievedRecord!.endDate).toBe('2024-06-15');
    });

    test('應該正確儲存和讀取隔日時間', async () => {
      const leaveRecord: Omit<LeaveRecord, 'id'> = {
        employeeId: 'E002',
        name: '測試員工2',
        leaveType: '事假',
        leaveDate: '2024-06-16', // 隔日開始時間的實際日期
        startTime: '02:00',
        endDate: '2024-06-16',
        endTime: '06:00',
        isStartNextDay: true, // 開始時間是隔日
        leaveHours: 4,
        reason: '夜班工作',
        approvalStatus: '簽核中',
        applicationDateTime: getTaiwanDateTime()
      };

      // 新增記錄
      const recordId = await addLeaveRecord(leaveRecord);
      expect(recordId).toBeDefined();

      // 讀取記錄
      const retrievedRecord = await getLeaveRecordById(recordId);
      expect(retrievedRecord).toBeDefined();
      expect(retrievedRecord!.startTime).toBe('02:00');
      expect(retrievedRecord!.endTime).toBe('06:00');
      expect(retrievedRecord!.isStartNextDay).toBe(true);
    });

    test('應該正確儲存和讀取跨日時間', async () => {
      const leaveRecord: Omit<LeaveRecord, 'id'> = {
        employeeId: 'E003',
        name: '測試員工3',
        leaveType: '事假',
        leaveDate: '2024-06-15', // 開始日期
        startTime: '22:00',
        endDate: '2024-06-16', // 結束日期（隔日）
        endTime: '06:00',
        isStartNextDay: false, // 開始時間不是隔日
        leaveHours: 8,
        reason: '跨日工作',
        approvalStatus: '簽核中',
        applicationDateTime: getTaiwanDateTime()
      };

      // 新增記錄
      const recordId = await addLeaveRecord(leaveRecord);
      expect(recordId).toBeDefined();

      // 讀取記錄
      const retrievedRecord = await getLeaveRecordById(recordId);
      expect(retrievedRecord).toBeDefined();
      expect(retrievedRecord!.startTime).toBe('22:00');
      expect(retrievedRecord!.endTime).toBe('06:00');
      expect(retrievedRecord!.leaveDate).toBe('2024-06-15');
      expect(retrievedRecord!.endDate).toBe('2024-06-16');
    });
  });

  describe('CSV格式相容性', () => {
    test('應該在CSV中正確儲存時間標記', async () => {
      // 新增多筆不同時間格式的記錄
      const records = [
        {
          employeeId: 'E001',
          name: '員工1',
          leaveType: '事假' as const,
          leaveDate: '2024-06-15',
          startTime: '09:00',
          endDate: '2024-06-15',
          endTime: '17:00',
          isStartNextDay: false,
          leaveHours: 7.5,
          reason: '當日時間',
          approvalStatus: '簽核中' as const,
          applicationDateTime: getTaiwanDateTime()
        },
        {
          employeeId: 'E002',
          name: '員工2',
          leaveType: '事假' as const,
          leaveDate: '2024-06-16',
          startTime: '02:00',
          endDate: '2024-06-16',
          endTime: '06:00',
          isStartNextDay: true, // 隔日開始時間
          leaveHours: 4,
          reason: '隔日開始時間',
          approvalStatus: '簽核中' as const,
          applicationDateTime: getTaiwanDateTime()
        },
        {
          employeeId: 'E003',
          name: '員工3',
          leaveType: '事假' as const,
          leaveDate: '2024-06-15',
          startTime: '22:00',
          endDate: '2024-06-16',
          endTime: '06:00',
          isStartNextDay: false,
          leaveHours: 8,
          reason: '跨日時間',
          approvalStatus: '簽核中' as const,
          applicationDateTime: getTaiwanDateTime()
        }
      ];

      // 新增所有記錄
      const recordIds = [];
      for (const record of records) {
        const id = await addLeaveRecord(record);
        recordIds.push(id);
      }

      // 讀取所有記錄
      const allRecords = await getAllLeaveRecords();
      expect(allRecords).toHaveLength(3);

      // 驗證CSV檔案內容
      expect(fs.existsSync(TEST_CSV_PATH)).toBe(true);
      const csvContent = fs.readFileSync(TEST_CSV_PATH, 'utf8');
      
      // 檢查CSV中是否包含正確的時間標記
      expect(csvContent).toContain('09:00'); // 當日時間
      expect(csvContent).toContain('02:00(+1)'); // 隔日開始時間
      expect(csvContent).toContain('06:00(+1)'); // 隔日結束時間（跨日情況）
    });

    test('應該正確讀取包含時間標記的CSV資料', async () => {
      // 先新增一筆隔日時間記錄
      const leaveRecord: Omit<LeaveRecord, 'id'> = {
        employeeId: 'E001',
        name: '測試員工',
        leaveType: '事假',
        leaveDate: '2024-06-16',
        startTime: '02:00',
        endDate: '2024-06-16',
        endTime: '06:00',
        isStartNextDay: true,
        leaveHours: 4,
        reason: '隔日工作',
        approvalStatus: '簽核中',
        applicationDateTime: getTaiwanDateTime()
      };

      const recordId = await addLeaveRecord(leaveRecord);

      // 重新讀取所有記錄（這會從CSV檔案讀取）
      const allRecords = await getAllLeaveRecords();
      const record = allRecords.find(r => r.id === recordId);

      expect(record).toBeDefined();
      expect(record!.startTime).toBe('02:00');
      expect(record!.endTime).toBe('06:00');
      expect(record!.isStartNextDay).toBe(true);
    });
  });

  describe('更新操作相容性', () => {
    test('應該正確更新時間格式', async () => {
      // 新增初始記錄
      const initialRecord: Omit<LeaveRecord, 'id'> = {
        employeeId: 'E001',
        name: '測試員工',
        leaveType: '事假',
        leaveDate: '2024-06-15',
        startTime: '09:00',
        endDate: '2024-06-15',
        endTime: '17:00',
        isStartNextDay: false,
        leaveHours: 7.5,
        reason: '初始記錄',
        approvalStatus: '簽核中',
        applicationDateTime: getTaiwanDateTime()
      };

      const recordId = await addLeaveRecord(initialRecord);

      // 更新為隔日時間
      const updates = {
        startTime: '02:00',
        endTime: '06:00',
        isStartNextDay: true,
        leaveHours: 4,
        reason: '更新為隔日時間'
      };

      await updateLeaveRecord(recordId, updates);

      // 驗證更新結果
      const updatedRecord = await getLeaveRecordById(recordId);
      expect(updatedRecord).toBeDefined();
      expect(updatedRecord!.startTime).toBe('02:00');
      expect(updatedRecord!.endTime).toBe('06:00');
      expect(updatedRecord!.isStartNextDay).toBe(true);
      expect(updatedRecord!.leaveHours).toBe(4);
    });
  });

  describe('向後相容性', () => {
    test('應該正確處理沒有隔日標記的舊資料', async () => {
      // 模擬舊格式的記錄（沒有isStartNextDay欄位）
      const oldFormatRecord: Omit<LeaveRecord, 'id'> = {
        employeeId: 'E001',
        name: '舊格式員工',
        leaveType: '事假',
        leaveDate: '2024-06-15',
        startTime: '09:00',
        endDate: '2024-06-15',
        endTime: '17:00',
        // isStartNextDay 欄位故意省略
        leaveHours: 7.5,
        reason: '舊格式記錄',
        approvalStatus: '簽核中',
        applicationDateTime: getTaiwanDateTime()
      } as any;

      const recordId = await addLeaveRecord(oldFormatRecord);
      const retrievedRecord = await getLeaveRecordById(recordId);

      expect(retrievedRecord).toBeDefined();
      expect(retrievedRecord!.startTime).toBe('09:00');
      expect(retrievedRecord!.endTime).toBe('17:00');
      // 應該預設為false
      expect(retrievedRecord!.isStartNextDay).toBe(false);
    });
  });
});