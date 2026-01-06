/**
 * 時間驗證和計算工具函數
 * 處理時間範圍驗證、請假時數計算和隔日時間解析
 */

// 時間驗證規則
export interface TimeValidationRules {
  format: RegExp;
  allowedValues: string[];
  required: boolean;
}

// 時間比較結果
export interface TimeComparison {
  startTime: string;
  endTime: string;
  isValid: boolean;
  errorMessage?: string;
}

// 請假時數計算結果
export interface LeaveHoursCalculation {
  startTime: string;
  endTime: string;
  totalMinutes: number;
  restMinutesDeducted: number;
  leaveHours: number;
}

// 時間解析結果
export interface ParsedTime {
  time: string;
  isNextDay: boolean;
}

// 休息時間配置
export interface RestPeriod {
  start: string;
  end: string;
}

export const REST_PERIODS: RestPeriod[] = [
  { start: '12:00', end: '12:30' },  // 午休時間
  { start: '16:30', end: '17:00' }   // 下午休息時間
];

export const MAX_REST_DEDUCTION_MINUTES = 30; // 0.5小時 = 30分鐘

/**
 * 解析時間值以判斷是否為隔日
 */
export function parseTimeValue(timeValue: string): ParsedTime {
  const isNextDay = timeValue.includes('(+1)');
  const time = timeValue.replace('(+1)', '');
  return { time, isNextDay };
}

/**
 * 格式化時間值用於儲存
 */
export function formatTimeForStorage(time: string, isNextDay: boolean): string {
  return isNextDay ? `${time}(+1)` : time;
}

/**
 * 將時間字串轉換為分鐘數
 */
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * 將分鐘數轉換為時間字串
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * 驗證時間範圍（結束時間晚於開始時間）
 */
export function validateTimeRange(startTime: string, endTime: string): TimeComparison {
  if (!startTime || !endTime) {
    return {
      startTime,
      endTime,
      isValid: false,
      errorMessage: '請選擇開始時間和結束時間'
    };
  }

  const start = parseTimeValue(startTime);
  const end = parseTimeValue(endTime);
  
  // 轉換為分鐘數進行比較
  const startMinutes = timeToMinutes(start.time) + (start.isNextDay ? 24 * 60 : 0);
  const endMinutes = timeToMinutes(end.time) + (end.isNextDay ? 24 * 60 : 0);
  
  const isValid = endMinutes > startMinutes;
  
  return {
    startTime,
    endTime,
    isValid,
    errorMessage: isValid ? undefined : '結束時間必須晚於開始時間。如果是跨日請假，請選擇帶有(+1)標記的隔日時間。'
  };
}

/**
 * 計算請假時數（扣除休息時間，上限0.5小時）
 */
export function calculateLeaveHours(startTime: string, endTime: string): LeaveHoursCalculation {
  const start = parseTimeValue(startTime);
  const end = parseTimeValue(endTime);
  
  // 轉換為分鐘數
  const startMinutes = timeToMinutes(start.time) + (start.isNextDay ? 24 * 60 : 0);
  const endMinutes = timeToMinutes(end.time) + (end.isNextDay ? 24 * 60 : 0);
  
  // 計算總時間差
  const totalMinutes = endMinutes - startMinutes;
  
  if (totalMinutes <= 0) {
    throw new Error('結束時間必須晚於開始時間，請檢查時間設定或使用隔日時間格式(+1)');
  }
  
  // 計算需要扣除的休息時間
  let restMinutesDeducted = 0;
  
  // 處理跨日情況的休息時間計算
  if (start.isNextDay && end.isNextDay) {
    // 兩個時間都在隔日，直接計算當日休息時間
    restMinutesDeducted = calculateRestTimeOverlap(
      timeToMinutes(start.time),
      timeToMinutes(end.time)
    );
  } else if (!start.isNextDay && !end.isNextDay) {
    // 兩個時間都在當日，直接計算當日休息時間
    restMinutesDeducted = calculateRestTimeOverlap(
      timeToMinutes(start.time),
      timeToMinutes(end.time)
    );
  } else if (!start.isNextDay && end.isNextDay) {
    // 開始時間在當日，結束時間在隔日
    // 計算當日從開始時間到23:59的休息時間
    const currentDayRest = calculateRestTimeOverlap(
      timeToMinutes(start.time),
      23 * 60 + 59
    );
    
    // 計算隔日從00:00到結束時間的休息時間
    const nextDayRest = calculateRestTimeOverlap(
      0,
      timeToMinutes(end.time)
    );
    
    restMinutesDeducted = currentDayRest + nextDayRest;
  }
  
  // 限制休息時間扣除上限
  restMinutesDeducted = Math.min(restMinutesDeducted, MAX_REST_DEDUCTION_MINUTES);
  
  // 計算最終請假時數
  const leaveMinutes = totalMinutes - restMinutesDeducted;
  const leaveHours = leaveMinutes / 60;
  
  return {
    startTime,
    endTime,
    totalMinutes,
    restMinutesDeducted,
    leaveHours: Math.round(leaveHours * 100) / 100 // 保留兩位小數
  };
}

/**
 * 計算指定時間範圍內與休息時間的重疊分鐘數
 */
function calculateRestTimeOverlap(startMinutes: number, endMinutes: number): number {
  let totalOverlap = 0;
  
  for (const restPeriod of REST_PERIODS) {
    const restStart = timeToMinutes(restPeriod.start);
    const restEnd = timeToMinutes(restPeriod.end);
    
    // 檢查是否與休息時間重疊
    const overlapStart = Math.max(startMinutes, restStart);
    const overlapEnd = Math.min(endMinutes, restEnd);
    
    if (overlapStart < overlapEnd) {
      totalOverlap += overlapEnd - overlapStart;
    }
  }
  
  return totalOverlap;
}

/**
 * 驗證時間值是否有效
 */
export function validateTimeValue(value: string): boolean {
  if (!value) return false;
  
  // 檢查格式
  const timeFormat = /^([01]?[0-9]|2[0-3]):[0-5][0-9](\(\+1\))?$/;
  if (!timeFormat.test(value)) {
    return false;
  }
  
  const parsed = parseTimeValue(value);
  const timeMinutes = timeToMinutes(parsed.time);
  
  // 檢查時間是否為15分鐘的倍數
  if (timeMinutes % 15 !== 0) {
    return false;
  }
  
  // 檢查隔日時間範圍
  if (parsed.isNextDay) {
    const hours = Math.floor(timeMinutes / 60);
    return hours >= 0 && hours <= 7; // 隔日時間只到07:00
  }
  
  return true;
}

/**
 * 獲取時間驗證規則
 */
export function getTimeValidationRules(): TimeValidationRules {
  // 生成所有有效的時間選項
  const allowedValues: string[] = [];
  
  // 當日時間選項 (00:00 - 23:45)
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeValue = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      allowedValues.push(timeValue);
    }
  }
  
  // 隔日早上時間選項 (00:00(+1) - 07:00(+1))
  for (let hour = 0; hour <= 7; hour++) {
    const endMinute = hour === 7 ? 1 : 60; // 07:00(+1) 為最後一個選項
    for (let minute = 0; minute < endMinute; minute += 15) {
      const timeValue = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}(+1)`;
      allowedValues.push(timeValue);
    }
  }
  
  return {
    format: /^([01]?[0-9]|2[0-3]):[0-5][0-9](\(\+1\))?$/,
    allowedValues,
    required: true
  };
}

/**
 * 錯誤類型枚舉
 */
export enum TimeValidationError {
  INVALID_TIME_FORMAT = 'INVALID_TIME_FORMAT',
  TIME_NOT_IN_OPTIONS = 'TIME_NOT_IN_OPTIONS',
  REQUIRED_FIELD_EMPTY = 'REQUIRED_FIELD_EMPTY',
  END_TIME_BEFORE_START = 'END_TIME_BEFORE_START',
  INVALID_TIME_RANGE = 'INVALID_TIME_RANGE'
}

/**
 * 獲取錯誤訊息
 */
export function getErrorMessage(error: TimeValidationError): string {
  switch (error) {
    case TimeValidationError.INVALID_TIME_FORMAT:
      return '時間格式不正確，請使用HH:MM格式';
    case TimeValidationError.TIME_NOT_IN_OPTIONS:
      return '請選擇有效的時間選項';
    case TimeValidationError.REQUIRED_FIELD_EMPTY:
      return '此欄位為必填';
    case TimeValidationError.END_TIME_BEFORE_START:
      return '結束時間必須晚於開始時間';
    case TimeValidationError.INVALID_TIME_RANGE:
      return '時間範圍無效';
    default:
      return '時間驗證錯誤';
  }
}

/**
 * 綜合時間驗證函數
 */
export function validateTimeInput(
  startTime: string,
  endTime: string
): {
  isValid: boolean;
  errors: { field: string; error: TimeValidationError; message: string }[];
} {
  const errors: { field: string; error: TimeValidationError; message: string }[] = [];
  
  // 檢查必填欄位
  if (!startTime) {
    errors.push({
      field: 'startTime',
      error: TimeValidationError.REQUIRED_FIELD_EMPTY,
      message: getErrorMessage(TimeValidationError.REQUIRED_FIELD_EMPTY)
    });
  }
  
  if (!endTime) {
    errors.push({
      field: 'endTime',
      error: TimeValidationError.REQUIRED_FIELD_EMPTY,
      message: getErrorMessage(TimeValidationError.REQUIRED_FIELD_EMPTY)
    });
  }
  
  // 如果有必填欄位為空，直接返回
  if (errors.length > 0) {
    return { isValid: false, errors };
  }
  
  // 檢查時間格式和有效性
  if (!validateTimeValue(startTime)) {
    errors.push({
      field: 'startTime',
      error: TimeValidationError.TIME_NOT_IN_OPTIONS,
      message: getErrorMessage(TimeValidationError.TIME_NOT_IN_OPTIONS)
    });
  }
  
  if (!validateTimeValue(endTime)) {
    errors.push({
      field: 'endTime',
      error: TimeValidationError.TIME_NOT_IN_OPTIONS,
      message: getErrorMessage(TimeValidationError.TIME_NOT_IN_OPTIONS)
    });
  }
  
  // 如果格式有問題，直接返回
  if (errors.length > 0) {
    return { isValid: false, errors };
  }
  
  // 檢查時間範圍
  const rangeValidation = validateTimeRange(startTime, endTime);
  if (!rangeValidation.isValid) {
    errors.push({
      field: 'timeRange',
      error: TimeValidationError.END_TIME_BEFORE_START,
      message: rangeValidation.errorMessage || getErrorMessage(TimeValidationError.END_TIME_BEFORE_START)
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}