import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// 錯誤類型定義
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

// 建立自定義錯誤類別
export class CustomApiError extends Error {
  public code?: string;
  public status?: number;
  public details?: any;

  constructor(message: string, code?: string, status?: number, details?: any) {
    super(message);
    this.name = 'CustomApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

// 建立 axios 實例
export const api: AxiosInstance = axios.create({
  baseURL: '/api', // 使用相對路徑，讓 Vite 代理處理
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 錯誤處理函數
const handleApiError = (error: AxiosError): CustomApiError => {
  console.error('API Error:', error);

  // 網路錯誤
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return new CustomApiError('請求超時，請檢查網路連線', 'TIMEOUT', 0);
    }
    return new CustomApiError('網路連線失敗，請檢查網路狀態', 'NETWORK_ERROR', 0);
  }

  const { status, data } = error.response;
  const errorData = data as any;
  
  // 根據狀態碼處理不同錯誤
  switch (status) {
    case 400:
      return new CustomApiError(
        errorData?.message || '請求參數錯誤',
        'BAD_REQUEST',
        400,
        errorData
      );
    case 401:
      return new CustomApiError(
        errorData?.message || '身份驗證失敗，請重新登入',
        'UNAUTHORIZED',
        401,
        errorData
      );
    case 403:
      return new CustomApiError(
        errorData?.message || '權限不足，無法執行此操作',
        'FORBIDDEN',
        403,
        errorData
      );
    case 404:
      return new CustomApiError(
        errorData?.message || '請求的資源不存在',
        'NOT_FOUND',
        404,
        errorData
      );
    case 409:
      return new CustomApiError(
        errorData?.message || '資料衝突，請重新整理後再試',
        'CONFLICT',
        409,
        errorData
      );
    case 422:
      return new CustomApiError(
        errorData?.message || '資料驗證失敗',
        'VALIDATION_ERROR',
        422,
        errorData
      );
    case 429:
      return new CustomApiError(
        errorData?.message || '請求過於頻繁，請稍後再試',
        'RATE_LIMIT',
        429,
        errorData
      );
    case 500:
      return new CustomApiError(
        errorData?.message || '伺服器內部錯誤，請稍後再試',
        'INTERNAL_ERROR',
        500,
        errorData
      );
    case 502:
      return new CustomApiError(
        '服務暫時無法使用，請稍後再試',
        'BAD_GATEWAY',
        502,
        errorData
      );
    case 503:
      return new CustomApiError(
        '服務維護中，請稍後再試',
        'SERVICE_UNAVAILABLE',
        503,
        errorData
      );
    default:
      return new CustomApiError(
        errorData?.message || `請求失敗 (${status})`,
        'UNKNOWN_ERROR',
        status,
        errorData
      );
  }
};

// 請求攔截器 - 自動添加 token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(handleApiError(error));
  }
);

// 回應攔截器 - 處理錯誤
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const customError = handleApiError(error);
    
    // 如果是 401 錯誤，清除會話存儲並重導向到登入頁面
    if (customError.status === 401) {
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user_data');
      // 同時清除本地存儲以確保完全清除
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      // 避免在登入頁面時重複重導向
      if (window.location.pathname !== '/leave_system/login') {
        window.location.href = '/leave_system/login';
      }
    }
    
    return Promise.reject(customError);
  }
);

// 工具函數：檢查是否為 API 錯誤
export const isApiError = (error: any): error is CustomApiError => {
  return error instanceof CustomApiError;
};

// 工具函數：獲取錯誤訊息
export const getErrorMessage = (error: any): string => {
  if (isApiError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return '發生未知錯誤';
};

export default api;