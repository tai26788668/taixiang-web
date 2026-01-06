/**
 * 日期時間工具函數
 * 處理時區轉換和格式化
 */

/**
 * 獲取台灣時間的格式化字串
 * @param date 可選的日期物件，預設為當前時間
 * @returns 格式化的台灣時間字串 (YYYY-MM-DD HH:mm:ss)
 */
export function getTaiwanDateTime(date?: Date): string {
  const targetDate = date || new Date();
  
  // 台灣時區是 UTC+8
  const taiwanOffset = 8 * 60; // 8小時 = 480分鐘
  const utc = targetDate.getTime() + (targetDate.getTimezoneOffset() * 60000);
  const taiwanTime = new Date(utc + (taiwanOffset * 60000));
  
  // 格式化為 YYYY-MM-DD HH:mm:ss
  const year = taiwanTime.getFullYear();
  const month = String(taiwanTime.getMonth() + 1).padStart(2, '0');
  const day = String(taiwanTime.getDate()).padStart(2, '0');
  const hours = String(taiwanTime.getHours()).padStart(2, '0');
  const minutes = String(taiwanTime.getMinutes()).padStart(2, '0');
  const seconds = String(taiwanTime.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 獲取台灣時間的日期字串
 * @param date 可選的日期物件，預設為當前時間
 * @returns 格式化的台灣日期字串 (YYYY-MM-DD)
 */
export function getTaiwanDate(date?: Date): string {
  const dateTime = getTaiwanDateTime(date);
  return dateTime.split(' ')[0];
}

/**
 * 獲取台灣時間的時間字串
 * @param date 可選的日期物件，預設為當前時間
 * @returns 格式化的台灣時間字串 (HH:mm:ss)
 */
export function getTaiwanTime(date?: Date): string {
  const dateTime = getTaiwanDateTime(date);
  return dateTime.split(' ')[1];
}

/**
 * 將UTC時間字串轉換為台灣時間字串
 * @param utcDateTimeString UTC時間字串 (ISO格式或 YYYY-MM-DD HH:mm:ss 格式)
 * @returns 台灣時間字串 (YYYY-MM-DD HH:mm:ss)
 */
export function convertUtcToTaiwan(utcDateTimeString: string): string {
  let utcDate: Date;
  
  // 檢查是否為ISO格式
  if (utcDateTimeString.includes('T') || utcDateTimeString.includes('Z')) {
    utcDate = new Date(utcDateTimeString);
  } else {
    // YYYY-MM-DD HH:mm:ss 格式，需要明確指定為UTC
    const [datePart, timePart] = utcDateTimeString.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
    utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
  }
  
  return getTaiwanDateTime(utcDate);
}

/**
 * 將台灣時間字串轉換為UTC時間字串
 * @param taiwanDateTimeString 台灣時間字串 (YYYY-MM-DD HH:mm:ss)
 * @returns UTC時間字串 (ISO格式)
 */
export function convertTaiwanToUtc(taiwanDateTimeString: string): string {
  // 解析台灣時間
  const [datePart, timePart] = taiwanDateTimeString.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes, seconds] = timePart.split(':').map(Number);
  
  // 創建UTC時間的Date物件，然後減去8小時得到實際的UTC時間
  const taiwanDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
  
  // 台灣時間比UTC快8小時，所以要減去8小時得到UTC時間
  const utcTime = taiwanDate.getTime() - (8 * 60 * 60 * 1000);
  const utcDate = new Date(utcTime);
  
  return utcDate.toISOString();
}

/**
 * 休息時間配置
 */
export interface RestPeriod {
  start: string;  // 開始時間 (HH:mm)
  end: string;    // 結束時間 (HH:mm)
}

export const REST_PERIODS: RestPeriod[] = [
  { start: '12:00', end: '12:30' },  // 午休時間
  { start: '16:30', end: '17:00' }   // 下午休息時間
];

export const MAX_REST_DEDUCTION_HOURS = 0.5; // 最大休息時間扣除（小時）

/**
 * 計算請假時數（包含休息時間扣除）
 * @param leaveDate 請假日期 (YYYY-MM-DD)
 * @param startTime 開始時間 (HH:mm)
 * @param endTime 結束時間 (HH:mm)
 * @param isEndNextDay 結束時間是否為隔日
 * @param isStartNextDay 開始時間是否為隔日
 * @returns number 請假時數（已扣除休息時間）
 */
export function calculateLeaveHours(
  leaveDate: string,
  startTime: string,
  endTime: string,
  isEndNextDay: boolean = false,
  isStartNextDay: boolean = false
): number {
  try {
    let startDate: Date;
    let endDate: Date;
    
    // 處理開始時間
    if (isStartNextDay) {
      // 如果開始時間是隔日，開始日期加一天
      const nextDay = new Date(leaveDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split('T')[0];
      startDate = new Date(`${nextDayStr}T${startTime}:00`);
    } else {
      startDate = new Date(`${leaveDate}T${startTime}:00`);
    }
    
    // 處理結束時間
    if (isEndNextDay) {
      // 如果結束時間是隔日，結束日期相對於實際開始日期加一天
      let endDateBase: string;
      if (isStartNextDay) {
        // 如果開始時間也是隔日，結束時間相對於開始時間的隔日
        const startNextDay = new Date(leaveDate);
        startNextDay.setDate(startNextDay.getDate() + 1);
        const endNextDay = new Date(startNextDay);
        endNextDay.setDate(endNextDay.getDate() + 1);
        endDateBase = endNextDay.toISOString().split('T')[0];
      } else {
        // 如果開始時間不是隔日，結束時間相對於基準日期加一天
        const nextDay = new Date(leaveDate);
        nextDay.setDate(nextDay.getDate() + 1);
        endDateBase = nextDay.toISOString().split('T')[0];
      }
      endDate = new Date(`${endDateBase}T${endTime}:00`);
    } else {
      // 結束時間不是隔日，使用與開始時間相同的日期邏輯
      const endDateBase = isStartNextDay ? 
        (() => {
          const nextDay = new Date(leaveDate);
          nextDay.setDate(nextDay.getDate() + 1);
          return nextDay.toISOString().split('T')[0];
        })() : 
        leaveDate;
      
      endDate = new Date(`${endDateBase}T${endTime}:00`);
    }

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('日期時間格式錯誤');
    }

    if (endDate <= startDate) {
      // 更詳細的錯誤檢查邏輯
      if (!isEndNextDay && !isStartNextDay) {
        // 兩個時間都在同一天，但結束時間不晚於開始時間
        throw new Error('結束時間必須晚於開始時間。如果是跨日請假，請在結束時間選擇帶有(+1)標記的隔日時間選項。');
      } else {
        // 有隔日標記但時間計算仍然有問題
        console.error('Date calculation error:', {
          leaveDate,
          startTime,
          endTime,
          isStartNextDay,
          isEndNextDay,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        });
        throw new Error('時間計算錯誤，請檢查時間設定');
      }
    }

    // 計算基本時數差異
    const diffMs = endDate.getTime() - startDate.getTime();
    let totalHours = diffMs / (1000 * 60 * 60);

    // 計算休息時間扣除
    let totalRestDeduction = 0;
    
    // 計算跨越的天數和每天的休息時間扣除
    const startDateOnly = startDate.toISOString().split('T')[0];
    const endDateOnly = endDate.toISOString().split('T')[0];
    
    if (startDateOnly === endDateOnly) {
      // 同一天的休息時間扣除
      totalRestDeduction = calculateRestTimeDeductionWithoutLimit(startDate, endDate, startDateOnly);
    } else {
      // 跨天的休息時間扣除
      const currentDate = new Date(startDateOnly);
      const finalDate = new Date(endDateOnly);
      
      while (currentDate <= finalDate) {
        const currentDateStr = currentDate.toISOString().split('T')[0];
        let dayStart: Date;
        let dayEnd: Date;
        
        if (currentDateStr === startDateOnly) {
          // 第一天：從開始時間到當天結束
          dayStart = startDate;
          dayEnd = new Date(`${currentDateStr}T23:59:59`);
        } else if (currentDateStr === endDateOnly) {
          // 最後一天：從當天開始到結束時間
          dayStart = new Date(`${currentDateStr}T00:00:00`);
          dayEnd = endDate;
        } else {
          // 中間的完整天
          dayStart = new Date(`${currentDateStr}T00:00:00`);
          dayEnd = new Date(`${currentDateStr}T23:59:59`);
        }
        
        totalRestDeduction += calculateRestTimeDeductionWithoutLimit(dayStart, dayEnd, currentDateStr);
        
        // 移到下一天
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    
    // 應用全局上限
    totalRestDeduction = Math.min(totalRestDeduction, MAX_REST_DEDUCTION_HOURS);
    totalHours -= totalRestDeduction;

    // 確保時數不會是負數
    totalHours = Math.max(0, totalHours);
    
    return Math.round(totalHours * 100) / 100; // 保留兩位小數
  } catch (error) {
    throw new Error(`計算請假時數失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
  }
}

/**
 * 計算指定時間段內的休息時間扣除（不應用上限）
 * @param start 開始時間
 * @param end 結束時間
 * @param dateStr 日期字串 (YYYY-MM-DD)
 * @returns number 需要扣除的休息時數
 */
function calculateRestTimeDeductionWithoutLimit(start: Date, end: Date, dateStr: string): number {
  let totalRestHours = 0;

  // 遍歷所有休息時間段
  for (const restPeriod of REST_PERIODS) {
    const restStart = new Date(`${dateStr}T${restPeriod.start}:00`);
    const restEnd = new Date(`${dateStr}T${restPeriod.end}:00`);

    // 檢查是否與休息時間重疊
    if (start < restEnd && end > restStart) {
      const overlapStart = new Date(Math.max(start.getTime(), restStart.getTime()));
      const overlapEnd = new Date(Math.min(end.getTime(), restEnd.getTime()));
      
      if (overlapEnd > overlapStart) {
        const overlapMs = overlapEnd.getTime() - overlapStart.getTime();
        totalRestHours += overlapMs / (1000 * 60 * 60);
      }
    }
  }

  return totalRestHours;
}

/**
 * 計算指定時間段內的休息時間扣除（累計上限0.5小時）
 * @param start 開始時間
 * @param end 結束時間
 * @param dateStr 日期字串 (YYYY-MM-DD)
 * @returns number 需要扣除的休息時數
 */
export function calculateRestTimeDeduction(start: Date, end: Date, dateStr: string): number {
  const totalRestHours = calculateRestTimeDeductionWithoutLimit(start, end, dateStr);
  
  // 累計扣除時間上限為0.5小時（這是針對整個請假申請的上限，不是每日上限）
  return Math.min(totalRestHours, MAX_REST_DEDUCTION_HOURS);
}