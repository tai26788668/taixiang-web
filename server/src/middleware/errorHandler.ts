import { Request, Response, NextFunction } from 'express';

// 錯誤類型定義
export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

// 自定義錯誤類別
export class CustomError extends Error implements ApiError {
  public statusCode: number;
  public code?: string;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.name = 'CustomError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

// 預定義錯誤類別
export class ValidationError extends CustomError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends CustomError {
  constructor(message: string = '身份驗證失敗') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends CustomError {
  constructor(message: string = '權限不足') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = '資源不存在') {
    super(message, 404, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends CustomError {
  constructor(message: string, details?: any) {
    super(message, 409, 'CONFLICT_ERROR', details);
    this.name = 'ConflictError';
  }
}

export class FileError extends CustomError {
  constructor(message: string, details?: any) {
    super(message, 500, 'FILE_ERROR', details);
    this.name = 'FileError';
  }
}

// 錯誤處理中介軟體
export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 記錄錯誤
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    timestamp: new Date().toISOString(),
  });

  // 設定預設狀態碼
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';

  // 開發環境下提供更詳細的錯誤資訊
  const isDevelopment = process.env.NODE_ENV === 'development';

  // 建立錯誤回應
  const errorResponse: any = {
    success: false,
    error: err.message,
    code,
    timestamp: new Date().toISOString(),
  };

  // 在開發環境下添加額外資訊
  if (isDevelopment) {
    errorResponse.stack = err.stack;
    errorResponse.details = err.details;
  }

  // 特殊處理某些錯誤類型
  if (err.details) {
    errorResponse.details = err.details;
  }

  res.status(statusCode).json(errorResponse);
};

// 404 處理中介軟體
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new NotFoundError(`路由 ${req.originalUrl} 不存在`);
  next(error);
};

// 非同步錯誤處理包裝器
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 驗證錯誤處理函數
export const handleValidationError = (errors: any[]): ValidationError => {
  const errorMessages = errors.map(error => error.message || error.msg).join(', ');
  return new ValidationError(`驗證失敗: ${errorMessages}`, errors);
};

// CSV 檔案錯誤處理函數
export const handleFileError = (error: any, operation: string): FileError => {
  let message = `檔案${operation}失敗`;
  
  if (error.code === 'ENOENT') {
    message = '檔案不存在';
  } else if (error.code === 'EACCES') {
    message = '檔案權限不足';
  } else if (error.code === 'EMFILE' || error.code === 'ENFILE') {
    message = '系統檔案數量限制';
  } else if (error.message) {
    message = `檔案${operation}失敗: ${error.message}`;
  }
  
  return new FileError(message, { originalError: error.message, code: error.code });
};