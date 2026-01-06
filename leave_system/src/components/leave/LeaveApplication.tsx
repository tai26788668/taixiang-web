import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { TimeSelector } from '../common/TimeSelector';
import { LeaveApplicationFormData, LeaveApplicationFormErrors, LeaveType } from '../../types';
import { api } from '../../services/api';
import { 
  validateTimeInput, 
  calculateLeaveHours
} from '../../utils/timeValidation';

export const LeaveApplication: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<LeaveApplicationFormData>({
    leaveType: '事假',
    leaveDate: '',
    startTime: '',
    endTime: '',
    reason: '',
  });
  
  const [errors, setErrors] = useState<LeaveApplicationFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState<string>('');
  const [calculatedHours, setCalculatedHours] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [calculationError, setCalculationError] = useState<string>('');
  const calculationTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  // 假別選項
  const leaveTypeOptions: { value: LeaveType; label: string }[] = [
    { value: '事假', label: t('leave.types.事假') },
    { value: '公假', label: t('leave.types.公假') },
    { value: '喪假', label: t('leave.types.喪假') },
    { value: '病假', label: t('leave.types.病假') },
    { value: '特休', label: t('leave.types.特休') },
    { value: '生理假', label: t('leave.types.生理假') },
  ];



  // 表單驗證
  const validateForm = (): boolean => {
    const newErrors: LeaveApplicationFormErrors = {};
    
    if (!formData.leaveType) {
      newErrors.leaveType = t('validation.required');
    }
    
    if (!formData.leaveDate) {
      newErrors.leaveDate = t('validation.required');
    }
    
    // 使用新的時間驗證邏輯
    const timeValidation = validateTimeInput(formData.startTime, formData.endTime);
    
    if (!timeValidation.isValid) {
      timeValidation.errors.forEach(error => {
        if (error.field === 'startTime') {
          newErrors.startTime = error.message;
        } else if (error.field === 'endTime') {
          newErrors.endTime = error.message;
        } else if (error.field === 'timeRange') {
          newErrors.endTime = error.message;
        }
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 計算請假時數
  const calculateHours = async () => {
    if (formData.leaveDate && formData.startTime && formData.endTime) {
      setIsCalculating(true);
      try {
        console.log('Calculating hours for:', {
          leaveDate: formData.leaveDate,
          startTime: formData.startTime,
          endTime: formData.endTime
        });
        
        // 使用本地計算邏輯
        const calculation = calculateLeaveHours(formData.startTime, formData.endTime);
        console.log('Calculated hours:', calculation.leaveHours);
        setCalculatedHours(calculation.leaveHours);
        setCalculationError('');
      } catch (error: any) {
        console.error('Hours calculation error:', error);
        setCalculatedHours(0);
        
        // 提供更清楚的錯誤訊息指導
        let errorMessage = error.message || '計算失敗，請稍後再試';
        
        // 如果是時間範圍錯誤，提供更具體的指導
        if (errorMessage.includes('結束時間必須晚於開始時間')) {
          errorMessage = '結束時間必須晚於開始時間。如果是跨日請假，請在結束時間選擇帶有(+1)標記的隔日時間選項。';
        }
        
        setCalculationError(errorMessage);
      } finally {
        setIsCalculating(false);
      }
    } else {
      console.log('Missing date/time fields, resetting hours to 0');
      setCalculatedHours(0);
      setCalculationError('');
      setIsCalculating(false);
    }
  };

  // 當日期時間變更時重新計算時數
  useEffect(() => {
    // 清除之前的計時器
    if (calculationTimeoutRef.current) {
      clearTimeout(calculationTimeoutRef.current);
    }
    
    // 設置新的計時器
    calculationTimeoutRef.current = setTimeout(() => {
      calculateHours();
    }, 500); // 增加防抖時間，避免頻繁調用

    // 清理函數
    return () => {
      if (calculationTimeoutRef.current) {
        clearTimeout(calculationTimeoutRef.current);
      }
    };
  }, [formData.leaveDate, formData.startTime, formData.endTime]);



  // 處理輸入變更
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // 清除該欄位的錯誤訊息
    if (errors[name as keyof LeaveApplicationFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
    
    // 清除提交錯誤和成功訊息
    if (submitError) {
      setSubmitError('');
    }
    if (submitSuccess) {
      setSubmitSuccess('');
    }
  };

  // 處理表單提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');
    
    try {
      // 準備提交資料，保持時間值中的(+1)標記讓後端解析
      const submitData = {
        ...formData,
        // 保持原始時間值，讓後端的 parseTimeValue 函數處理
        startTime: formData.startTime,
        endTime: formData.endTime
      };
      
      const response = await api.post('/leave/apply', submitData);
      
      if (response.data.success) {
        setSubmitSuccess(t('leave.application.success'));
        // 重置表單
        setFormData({
          leaveType: '事假',
          leaveDate: '',
          startTime: '',
          endTime: '',
          reason: '',
        });
        setCalculatedHours(0);
        setCalculationError('');
      } else {
        setSubmitError(response.data.message || t('leave.application.error'));
      }
    } catch (error: any) {
      console.error('Leave application error:', error);
      
      if (error.response?.data?.message) {
        setSubmitError(error.response.data.message);
      } else if (error.message) {
        setSubmitError(error.message);
      } else {
        setSubmitError(t('leave.application.error'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 檢查表單是否可以提交（所有必填欄位都已填寫）
  const isFormValid = formData.leaveType && formData.leaveDate && formData.startTime && 
                     formData.endTime;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 工號欄位 - 自動填入且不可編輯 */}
        <div>
          <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">
            {t('leave.application.employeeId')}
          </label>
          <input
            type="text"
            id="employeeId"
            value={user?.employeeId || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
            disabled
          />
        </div>

        {/* 姓名欄位 - 自動填入且不可編輯 */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            {t('leave.application.name')}
          </label>
          <input
            type="text"
            id="name"
            value={user?.name || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
            disabled
          />
        </div>

        {/* 假別選擇 - 移到前面 */}
        <div>
          <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 mb-1">
            {t('leave.application.leaveType')} *
          </label>
          <select
            id="leaveType"
            name="leaveType"
            value={formData.leaveType}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.leaveType ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          >
            {leaveTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.leaveType && (
            <p className="mt-1 text-sm text-red-600">{errors.leaveType}</p>
          )}
        </div>

        {/* 請假日期 */}
        <div>
          <label htmlFor="leaveDate" className="block text-sm font-medium text-gray-700 mb-1">
            {t('leave.application.leaveDate')} *
          </label>
          <input
            type="date"
            id="leaveDate"
            name="leaveDate"
            value={formData.leaveDate}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.leaveDate ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.leaveDate && (
            <p className="mt-1 text-sm text-red-600">{errors.leaveDate}</p>
          )}
        </div>

        {/* 開始時間 - 使用TimeSelector */}
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
            {t('leave.application.startTime')} *
          </label>
          <TimeSelector
            id="startTime"
            name="startTime"
            value={formData.startTime}
            onChange={handleInputChange}
            placeholder={t('leave.application.selectStartTime')}
            className="w-full"
            disabled={isSubmitting}
            loading={isSubmitting}
            error={!!errors.startTime}
            errorMessage={errors.startTime}
            aria-label={t('leave.application.selectStartTime')}
          />
          {formData.startTime && formData.startTime.includes('(+1)') && (
            <p className="mt-1 text-sm text-blue-600">
              {t('leave.application.startTimeNextDay')} {formData.startTime.replace('(+1)', '')}
            </p>
          )}
        </div>

        {/* 結束時間 - 使用TimeSelector */}
        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
            {t('leave.application.endTime')} *
          </label>
          <TimeSelector
            id="endTime"
            name="endTime"
            value={formData.endTime}
            onChange={handleInputChange}
            placeholder={t('leave.application.selectEndTime')}
            className="w-full"
            disabled={isSubmitting}
            loading={isSubmitting}
            error={!!errors.endTime}
            errorMessage={errors.endTime}
            aria-label={t('leave.application.selectEndTime')}
          />
          {formData.endTime && formData.endTime.includes('(+1)') && (
            <p className="mt-1 text-sm text-blue-600">
              {t('leave.application.endTimeNextDay')} {formData.endTime.replace('(+1)', '')}
            </p>
          )}
        </div>

        {/* 請假時數顯示 - 固定顯示但不可編輯 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('leave.application.leaveHoursWithBreaks')}
          </label>
          <input
            type="text"
            value={isCalculating ? t('leave.application.calculating') : (calculatedHours > 0 ? `${calculatedHours} ${t('leave.application.hours')}` : `0 ${t('leave.application.hours')}`)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm bg-gray-100 cursor-not-allowed font-semibold ${
              calculationError ? 'border-red-300 text-red-600' : 'border-gray-300 text-blue-600'
            }`}
            disabled
            readOnly
          />
          {calculationError && (
            <p className="mt-1 text-sm text-red-600">{calculationError}</p>
          )}
        </div>

        {/* 事由 - 移到最後 */}
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
            {t('leave.application.reason')}
          </label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('leave.application.reasonPlaceholder')}
            disabled={isSubmitting}
          />
        </div>

        {/* 成功訊息 */}
        {submitSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-sm text-green-600">{submitSuccess}</p>
          </div>
        )}

        {/* 錯誤訊息 */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{submitError}</p>
          </div>
        )}

        {/* 提交按鈕 */}
        <button
          type="submit"
          disabled={isSubmitting || !isFormValid}
          className={`w-full py-2 px-4 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isSubmitting || !isFormValid
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? t('common.loading') : t('leave.application.submit')}
        </button>
      </form>
    </div>
  );
};