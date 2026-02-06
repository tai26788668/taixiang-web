import path from 'path';
import { PersonalData, ErrorCode } from '../types';
import { readCsvFile, writeCsvFile, checkCsvFileExists, validateCsvData } from '../utils/csvUtils';

/**
 * 個人資料CSV處理服務
 * 處理員工個人資料的讀取、查詢和驗證
 */

export class PersonalDataService {
  /**
   * 獲取所有用戶
   */
  async getAllUsers(): Promise<PersonalData[]> {
    return getAllPersonalData();
  }

  /**
   * 根據工號查找用戶
   */
  async findByEmployeeId(employeeId: string): Promise<PersonalData | null> {
    return getPersonalDataByEmployeeId(employeeId);
  }

  /**
   * 驗證登入憑證
   */
  async validateCredentials(employeeId: string, password: string): Promise<PersonalData | null> {
    return validateCredentials(employeeId, password);
  }

  /**
   * 新增用戶
   */
  async addUser(userData: PersonalData): Promise<void> {
    return addPersonalData(userData);
  }

  /**
   * 更新用戶
   */
  async updateUser(employeeId: string, userData: PersonalData): Promise<void> {
    return updatePersonalData(employeeId, {
      name: userData.name,
      password: userData.password,
      permission: userData.permission,
      annualLeave: userData.annualLeave,
      sickLeave: userData.sickLeave,
      menstrualLeave: userData.menstrualLeave,
      personalLeave: userData.personalLeave
    });
  }

  /**
   * 刪除用戶
   */
  async deleteUser(employeeId: string): Promise<void> {
    return deletePersonalData(employeeId);
  }

  /**
   * 檢查是否為管理者
   */
  async isAdmin(employeeId: string): Promise<boolean> {
    return isAdmin(employeeId);
  }
}

const PERSONAL_DATA_FILE = process.env.NODE_ENV === 'test' 
  ? path.join(__dirname, '../../test-data/personal_data.csv')
  : path.join(process.env.PERSISTENT_DISK_PATH || '/mnt/data', 'personal_data.csv');

const PERSONAL_DATA_HEADERS = [
  { id: 'employeeId', title: '工號' },
  { id: 'password', title: '密碼' },
  { id: 'name', title: '姓名' },
  { id: 'permission', title: '權限' },
  { id: 'annualLeave', title: '年度特休' },
  { id: 'sickLeave', title: '年度病假' },
  { id: 'menstrualLeave', title: '年度生理假' },
  { id: 'personalLeave', title: '年度事假' }
];

const REQUIRED_FIELDS = ['工號', '密碼', '姓名', '權限', '年度特休', '年度病假', '年度生理假', '年度事假'];

/**
 * 讀取所有個人資料
 * @returns Promise<PersonalData[]>
 */
export async function getAllPersonalData(): Promise<PersonalData[]> {
  try {
    if (!checkCsvFileExists(PERSONAL_DATA_FILE)) {
      throw new Error(`個人資料檔案不存在: ${PERSONAL_DATA_FILE}`);
    }

    const rawData = await readCsvFile(PERSONAL_DATA_FILE);
    
    // 驗證資料格式
    const validation = validateCsvData(rawData, REQUIRED_FIELDS);
    if (!validation.isValid) {
      throw new Error(`個人資料格式錯誤: ${validation.errors.join(', ')}`);
    }

    // 轉換為PersonalData格式
    return rawData.map(record => ({
      employeeId: record['工號'],
      password: record['密碼'],
      name: record['姓名'],
      permission: record['權限'] as 'employee' | 'admin',
      annualLeave: parseFloat(record['年度特休']) || 0,
      sickLeave: parseFloat(record['年度病假']) || 0,
      menstrualLeave: parseFloat(record['年度生理假']) || 0,
      personalLeave: parseFloat(record['年度事假']) || 0
    }));
  } catch (error) {
    throw new Error(`讀取個人資料失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
  }
}

/**
 * 根據工號查詢個人資料
 * @param employeeId 工號
 * @returns Promise<PersonalData | null>
 */
export async function getPersonalDataByEmployeeId(employeeId: string): Promise<PersonalData | null> {
  try {
    if (!employeeId || employeeId.trim() === '') {
      throw new Error('工號不能為空');
    }

    const allData = await getAllPersonalData();
    const found = allData.find(data => data.employeeId === employeeId.trim());
    
    return found || null;
  } catch (error) {
    throw new Error(`查詢個人資料失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
  }
}

/**
 * 驗證登入憑證
 * @param employeeId 工號
 * @param password 密碼
 * @returns Promise<PersonalData | null>
 */
export async function validateCredentials(employeeId: string, password: string): Promise<PersonalData | null> {
  try {
    if (!employeeId || employeeId.trim() === '') {
      throw new Error('工號不能為空');
    }
    
    if (!password || password.trim() === '') {
      throw new Error('密碼不能為空');
    }

    const personalData = await getPersonalDataByEmployeeId(employeeId);
    
    if (!personalData) {
      return null; // 使用者不存在
    }

    // 簡單密碼比對（實際應用中應使用加密比對）
    if (personalData.password === password.trim()) {
      return personalData;
    }

    return null; // 密碼錯誤
  } catch (error) {
    throw new Error(`驗證登入憑證失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
  }
}

/**
 * 檢查使用者是否為管理者
 * @param employeeId 工號
 * @returns Promise<boolean>
 */
export async function isAdmin(employeeId: string): Promise<boolean> {
  try {
    const personalData = await getPersonalDataByEmployeeId(employeeId);
    return personalData?.permission === 'admin';
  } catch (error) {
    throw new Error(`檢查管理者權限失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
  }
}

/**
 * 新增個人資料
 * @param personalData 個人資料
 * @returns Promise<void>
 */
export async function addPersonalData(personalData: PersonalData): Promise<void> {
  try {
    // 驗證資料格式
    if (!personalData.employeeId || personalData.employeeId.trim() === '') {
      throw new Error('工號不能為空');
    }
    
    if (!personalData.password || personalData.password.trim() === '') {
      throw new Error('密碼不能為空');
    }
    
    if (!personalData.name || personalData.name.trim() === '') {
      throw new Error('姓名不能為空');
    }
    
    if (!['employee', 'admin'].includes(personalData.permission)) {
      throw new Error('權限必須是 employee 或 admin');
    }

    // 檢查工號是否已存在
    const existing = await getPersonalDataByEmployeeId(personalData.employeeId);
    if (existing) {
      throw new Error(`工號 ${personalData.employeeId} 已存在`);
    }

    // 讀取現有資料
    const allData = await getAllPersonalData();
    
    // 新增資料
    allData.push(personalData);
    
    // 寫入檔案
    await writeCsvFile(PERSONAL_DATA_FILE, allData, PERSONAL_DATA_HEADERS);
  } catch (error) {
    throw new Error(`新增個人資料失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
  }
}

/**
 * 更新個人資料
 * @param employeeId 工號
 * @param updates 要更新的欄位
 * @returns Promise<void>
 */
export async function updatePersonalData(
  employeeId: string, 
  updates: Partial<Omit<PersonalData, 'employeeId'>>
): Promise<void> {
  try {
    if (!employeeId || employeeId.trim() === '') {
      throw new Error('工號不能為空');
    }

    // 讀取現有資料
    const allData = await getAllPersonalData();
    const index = allData.findIndex(data => data.employeeId === employeeId);
    
    if (index === -1) {
      throw new Error(`找不到工號 ${employeeId} 的個人資料`);
    }

    console.log(`=== 更新用戶 ${employeeId} ===`);
    console.log('更新前資料:', allData[index]);
    console.log('更新內容:', updates);

    // 更新資料
    if (updates.password !== undefined) {
      if (!updates.password || updates.password.trim() === '') {
        throw new Error('密碼不能為空');
      }
      allData[index].password = updates.password.trim();
    }
    
    if (updates.name !== undefined) {
      if (!updates.name || updates.name.trim() === '') {
        throw new Error('姓名不能為空');
      }
      console.log(`姓名更新: "${allData[index].name}" -> "${updates.name.trim()}"`);
      allData[index].name = updates.name.trim();
    }
    
    if (updates.permission !== undefined) {
      if (!['employee', 'admin'].includes(updates.permission)) {
        throw new Error('權限必須是 employee 或 admin');
      }
      allData[index].permission = updates.permission;
    }

    // 更新假別時數
    if (updates.annualLeave !== undefined) {
      allData[index].annualLeave = updates.annualLeave;
    }
    
    if (updates.sickLeave !== undefined) {
      allData[index].sickLeave = updates.sickLeave;
    }
    
    if (updates.menstrualLeave !== undefined) {
      allData[index].menstrualLeave = updates.menstrualLeave;
    }

    if (updates.personalLeave !== undefined) {
      allData[index].personalLeave = updates.personalLeave;
    }

    console.log('更新後資料:', allData[index]);

    // 寫入檔案
    await writeCsvFile(PERSONAL_DATA_FILE, allData, PERSONAL_DATA_HEADERS);
    
    console.log('CSV檔案寫入完成');
  } catch (error) {
    console.error('更新個人資料錯誤:', error);
    throw new Error(`更新個人資料失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
  }
}

/**
 * 刪除個人資料
 * @param employeeId 工號
 * @returns Promise<void>
 */
export async function deletePersonalData(employeeId: string): Promise<void> {
  try {
    if (!employeeId || employeeId.trim() === '') {
      throw new Error('工號不能為空');
    }

    // 讀取現有資料
    const allData = await getAllPersonalData();
    const filteredData = allData.filter(data => data.employeeId !== employeeId);
    
    if (filteredData.length === allData.length) {
      throw new Error(`找不到工號 ${employeeId} 的個人資料`);
    }

    // 寫入檔案
    await writeCsvFile(PERSONAL_DATA_FILE, filteredData, PERSONAL_DATA_HEADERS);
  } catch (error) {
    throw new Error(`刪除個人資料失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
  }
}

/**
 * 取得所有管理者
 * @returns Promise<PersonalData[]>
 */
export async function getAllAdmins(): Promise<PersonalData[]> {
  try {
    const allData = await getAllPersonalData();
    return allData.filter(data => data.permission === 'admin');
  } catch (error) {
    throw new Error(`取得管理者列表失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
  }
}

/**
 * 取得所有員工
 * @returns Promise<PersonalData[]>
 */
export async function getAllEmployees(): Promise<PersonalData[]> {
  try {
    const allData = await getAllPersonalData();
    return allData.filter(data => data.permission === 'employee');
  } catch (error) {
    throw new Error(`取得員工列表失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
  }
}

/**
 * 驗證個人資料檔案完整性
 * @returns Promise<{ isValid: boolean; errors: string[] }>
 */
export async function validatePersonalDataFile(): Promise<{ isValid: boolean; errors: string[] }> {
  try {
    if (!checkCsvFileExists(PERSONAL_DATA_FILE)) {
      return {
        isValid: false,
        errors: ['個人資料檔案不存在']
      };
    }

    const rawData = await readCsvFile(PERSONAL_DATA_FILE);
    const validation = validateCsvData(rawData, REQUIRED_FIELDS);
    
    if (!validation.isValid) {
      return validation;
    }

    // 額外驗證邏輯
    const errors: string[] = [];
    const employeeIds = new Set<string>();
    
    rawData.forEach((record, index) => {
      const employeeId = record['工號'];
      const permission = record['權限'];
      
      // 檢查工號重複
      if (employeeIds.has(employeeId)) {
        errors.push(`第 ${index + 1} 筆記錄工號重複: ${employeeId}`);
      } else {
        employeeIds.add(employeeId);
      }
      
      // 檢查權限值
      if (!['employee', 'admin'].includes(permission)) {
        errors.push(`第 ${index + 1} 筆記錄權限值無效: ${permission}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [`驗證個人資料檔案失敗: ${error instanceof Error ? error.message : '未知錯誤'}`]
    };
  }
}