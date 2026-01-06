/**
 * 請假時數顯示組件
 */
import React from 'react';
import { LeaveHoursCalculation } from '../../utils/timeValidation';

interface LeaveHoursDisplayProps {
  calculation: LeaveHoursCalculation | null;
  className?: string;
  showDetails?: boolean;
  label?: string;
}

export const LeaveHoursDisplay: React.FC<LeaveHoursDisplayProps> = ({
  calculation,
  className = '',
  showDetails = false,
  label = '請假時數'
}) => {
  if (!calculation) {
    return (
      <div className={`text-gray-500 ${className}`}>
        <span className="text-sm">{label}：--</span>
      </div>
    );
  }

  const formatHours = (hours: number): string => {
    return hours.toFixed(2);
  };

  const formatMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours}小時${mins}分鐘`;
    } else if (hours > 0) {
      return `${hours}小時`;
    } else {
      return `${mins}分鐘`;
    }
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">{label}：</span>
        <span className="text-lg font-semibold text-blue-600">
          {formatHours(calculation.leaveHours)} 小時
        </span>
      </div>
      
      {showDetails && (
        <div className="mt-2 text-xs text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>總時間：</span>
            <span>{formatMinutes(calculation.totalMinutes)}</span>
          </div>
          
          {calculation.restMinutesDeducted > 0 && (
            <div className="flex justify-between">
              <span>扣除休息時間：</span>
              <span className="text-red-500">
                -{formatMinutes(calculation.restMinutesDeducted)}
              </span>
            </div>
          )}
          
          <div className="border-t pt-1 flex justify-between font-medium">
            <span>實際請假時數：</span>
            <span className="text-blue-600">
              {formatHours(calculation.leaveHours)} 小時
            </span>
          </div>
          
          <div className="text-xs text-gray-500 mt-2">
            <div>時間範圍：{calculation.startTime} - {calculation.endTime}</div>
            {calculation.restMinutesDeducted > 0 && (
              <div className="mt-1">
                * 已自動扣除重疊的休息時間（午休12:00-12:30，下午休息16:30-17:00）
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface LeaveHoursInputProps {
  value: number | null;
  calculation: LeaveHoursCalculation | null;
  onChange?: (hours: number) => void;
  readOnly?: boolean;
  className?: string;
  label?: string;
  showCalculationDetails?: boolean;
}

export const LeaveHoursInput: React.FC<LeaveHoursInputProps> = ({
  value,
  calculation,
  onChange,
  readOnly = true,
  className = '',
  label = '請假時數',
  showCalculationDetails = false
}) => {
  const displayValue = value !== null ? value.toFixed(2) : '';
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange && !readOnly) {
      const newValue = parseFloat(e.target.value);
      if (!isNaN(newValue) && newValue >= 0) {
        onChange(newValue);
      }
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      
      <div className="relative">
        <input
          type="number"
          value={displayValue}
          onChange={handleChange}
          readOnly={readOnly}
          step="0.01"
          min="0"
          className={`
            w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
            focus:outline-none focus:ring-blue-500 focus:border-blue-500
            ${readOnly ? 'bg-gray-50 text-gray-600' : 'bg-white'}
          `}
          placeholder="0.00"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <span className="text-gray-500 text-sm">小時</span>
        </div>
      </div>
      
      {showCalculationDetails && calculation && (
        <div className="mt-2">
          <LeaveHoursDisplay 
            calculation={calculation} 
            showDetails={true}
            label=""
            className="text-xs"
          />
        </div>
      )}
      
      {readOnly && calculation && (
        <div className="mt-1 text-xs text-gray-500">
          * 根據選擇的時間自動計算（已扣除休息時間）
        </div>
      )}
    </div>
  );
};

export default LeaveHoursDisplay;