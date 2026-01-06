/**
 * 時間驗證錯誤顯示組件
 */
import React from 'react';
import { TimeValidationError as TimeValidationErrorType } from '../../utils/timeValidation';

interface TimeValidationErrorProps {
  error?: {
    field: string;
    error: TimeValidationErrorType;
    message: string;
  };
  className?: string;
}

export const TimeValidationError: React.FC<TimeValidationErrorProps> = ({
  error,
  className = ''
}) => {
  if (!error) {
    return null;
  }

  return (
    <div 
      className={`text-sm text-red-600 mt-1 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <span className="flex items-center">
        <svg 
          className="w-4 h-4 mr-1 flex-shrink-0" 
          fill="currentColor" 
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path 
            fillRule="evenodd" 
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
            clipRule="evenodd" 
          />
        </svg>
        {error.message}
      </span>
    </div>
  );
};

interface TimeValidationErrorListProps {
  errors: {
    field: string;
    error: TimeValidationErrorType;
    message: string;
  }[];
  className?: string;
  showFieldNames?: boolean;
}

export const TimeValidationErrorList: React.FC<TimeValidationErrorListProps> = ({
  errors,
  className = '',
  showFieldNames = false
}) => {
  if (!errors || errors.length === 0) {
    return null;
  }

  const getFieldDisplayName = (field: string): string => {
    switch (field) {
      case 'startTime':
        return '開始時間';
      case 'endTime':
        return '結束時間';
      case 'timeRange':
        return '時間範圍';
      case 'calculation':
        return '時數計算';
      default:
        return field;
    }
  };

  return (
    <div 
      className={`space-y-1 ${className}`}
      role="alert"
      aria-live="polite"
    >
      {errors.map((error, index) => (
        <div 
          key={`${error.field}-${index}`}
          className="text-sm text-red-600 flex items-center"
        >
          <svg 
            className="w-4 h-4 mr-1 flex-shrink-0" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
          <span>
            {showFieldNames && (
              <span className="font-medium">
                {getFieldDisplayName(error.field)}：
              </span>
            )}
            {error.message}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TimeValidationError;