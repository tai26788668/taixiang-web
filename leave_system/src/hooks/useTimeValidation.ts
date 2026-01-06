/**
 * 時間驗證和計算的自定義Hook
 */
import { useState, useCallback, useMemo } from 'react';
import {
  validateTimeInput,
  calculateLeaveHours,
  validateTimeRange,
  TimeValidationError,
  type LeaveHoursCalculation,
  type TimeComparison
} from '../utils/timeValidation';

export interface UseTimeValidationOptions {
  autoCalculateHours?: boolean;
  onHoursCalculated?: (calculation: LeaveHoursCalculation) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export interface TimeValidationState {
  startTime: string;
  endTime: string;
  isValid: boolean;
  errors: { field: string; error: TimeValidationError; message: string }[];
  leaveHours: number | null;
  calculation: LeaveHoursCalculation | null;
}

export function useTimeValidation(options: UseTimeValidationOptions = {}) {
  const { autoCalculateHours = true, onHoursCalculated, onValidationChange } = options;

  const [state, setState] = useState<TimeValidationState>({
    startTime: '',
    endTime: '',
    isValid: false,
    errors: [],
    leaveHours: null,
    calculation: null
  });

  // 驗證時間輸入
  const validateTimes = useCallback((startTime: string, endTime: string) => {
    const validation = validateTimeInput(startTime, endTime);
    
    let calculation: LeaveHoursCalculation | null = null;
    let leaveHours: number | null = null;

    // 如果驗證通過且需要自動計算時數
    if (validation.isValid && autoCalculateHours && startTime && endTime) {
      try {
        calculation = calculateLeaveHours(startTime, endTime);
        leaveHours = calculation.leaveHours;
        
        if (onHoursCalculated) {
          onHoursCalculated(calculation);
        }
      } catch (error) {
        // 計算失敗時添加錯誤
        validation.errors.push({
          field: 'calculation',
          error: TimeValidationError.INVALID_TIME_RANGE,
          message: error instanceof Error ? error.message : '時數計算失敗'
        });
        validation.isValid = false;
      }
    }

    const newState: TimeValidationState = {
      startTime,
      endTime,
      isValid: validation.isValid,
      errors: validation.errors,
      leaveHours,
      calculation
    };

    setState(newState);

    if (onValidationChange) {
      onValidationChange(validation.isValid);
    }

    return newState;
  }, [autoCalculateHours, onHoursCalculated, onValidationChange]);

  // 設置開始時間
  const setStartTime = useCallback((startTime: string) => {
    return validateTimes(startTime, state.endTime);
  }, [state.endTime, validateTimes]);

  // 設置結束時間
  const setEndTime = useCallback((endTime: string) => {
    return validateTimes(state.startTime, endTime);
  }, [state.startTime, validateTimes]);

  // 同時設置開始和結束時間
  const setTimes = useCallback((startTime: string, endTime: string) => {
    return validateTimes(startTime, endTime);
  }, [validateTimes]);

  // 重置狀態
  const reset = useCallback(() => {
    const newState: TimeValidationState = {
      startTime: '',
      endTime: '',
      isValid: false,
      errors: [],
      leaveHours: null,
      calculation: null
    };
    setState(newState);
    return newState;
  }, []);

  // 獲取特定欄位的錯誤訊息
  const getFieldError = useCallback((field: string) => {
    return state.errors.find(error => error.field === field);
  }, [state.errors]);

  // 檢查特定欄位是否有錯誤
  const hasFieldError = useCallback((field: string) => {
    return state.errors.some(error => error.field === field);
  }, [state.errors]);

  // 獲取所有錯誤訊息
  const getAllErrorMessages = useMemo(() => {
    return state.errors.map(error => error.message);
  }, [state.errors]);

  // 手動計算請假時數
  const calculateHours = useCallback((startTime?: string, endTime?: string) => {
    const start = startTime || state.startTime;
    const end = endTime || state.endTime;

    if (!start || !end) {
      throw new Error('請提供開始時間和結束時間');
    }

    try {
      const calculation = calculateLeaveHours(start, end);
      
      setState(prev => ({
        ...prev,
        calculation,
        leaveHours: calculation.leaveHours
      }));

      if (onHoursCalculated) {
        onHoursCalculated(calculation);
      }

      return calculation;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '時數計算失敗');
    }
  }, [state.startTime, state.endTime, onHoursCalculated]);

  // 驗證時間範圍
  const validateRange = useCallback((startTime?: string, endTime?: string): TimeComparison => {
    const start = startTime || state.startTime;
    const end = endTime || state.endTime;
    
    return validateTimeRange(start, end);
  }, [state.startTime, state.endTime]);

  return {
    // 狀態
    ...state,
    
    // 操作函數
    setStartTime,
    setEndTime,
    setTimes,
    reset,
    
    // 錯誤處理
    getFieldError,
    hasFieldError,
    getAllErrorMessages,
    
    // 計算函數
    calculateHours,
    validateRange,
    
    // 便利屬性
    hasErrors: state.errors.length > 0,
    startTimeError: state.errors.find(e => e.field === 'startTime'),
    endTimeError: state.errors.find(e => e.field === 'endTime'),
    rangeError: state.errors.find(e => e.field === 'timeRange'),
    calculationError: state.errors.find(e => e.field === 'calculation')
  };
}

export default useTimeValidation;